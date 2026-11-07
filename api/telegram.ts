import type { IncomingMessage, ServerResponse } from 'http';

/**
 * Telegram-бот: webhook + статистика лидов из Google Таблицы.
 *
 * Роутинг: POST /api/telegram (webhook от Telegram),
 *         GET  /api/telegram?action=setup&key=<TELEGRAM_WEBHOOK_SECRET> — однократная регистрация webhook.
 *
 * Переменные окружения (те же, что для /api/lead, плюс):
 *  - TELEGRAM_WEBHOOK_SECRET — секрет для webhook (header X-Telegram-Bot-Api-Secret-Token)
 *  - GOOGLE_SHEETS_WEBAPP_URL — тот же URL Apps Script (doGet отдаёт статистику)
 *
 * Команды в чате с ботом (только для TELEGRAM_CHAT_ID):
 *  /start            — подсказка
 *  /stats            — статистика за месяц
 *  /stats неделя     — за 2 недели
 *  /stats месяц      — за месяц
 *  /stats полгода    — за полгода
 *  /stats всё        — за всё время
 */

const SHEET_LINK =
  'https://docs.google.com/spreadsheets/d/1KB5x2I0ouSeVGRRozfx2CNq_JVPfPLJtaq_Zal55nb8/edit';

const TYPE_LABELS: Record<string, string> = {
  application: '🔥 Заявки на программу',
  quiz_contact: '⭐ Лиды с теста (есть контакт)',
  quiz_result: '📊 Результаты теста (без контакта)',
};

interface Period {
  match: RegExp;
  days: number | 'all';
  label: string;
}

const PERIODS: Period[] = [
  { match: /полгода|6\s*мес|half/i, days: 182, label: 'за полгода' },
  { match: /месяц|month/i, days: 30, label: 'за месяц' },
  { match: /недел|week/i, days: 14, label: 'за 2 недели' },
  { match: /все|всё|all/i, days: 'all', label: 'за всё время' },
];

interface TgUpdate {
  message?: {
    chat?: { id?: number | string; type?: string };
    from?: { id?: number | string };
    text?: string;
  };
  callback_query?: {
    id?: string;
    from?: { id?: number | string };
    message?: { chat?: { id?: number | string; type?: string } };
    data?: string;
  };
}

/** Проверяет, что пользователь состоит в целевой группе/чате. */
async function isGroupMember(chatId: string | number, userId: number | string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getChatMember`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({ chat_id: chatId, user_id: userId }),
    });
    if (!response.ok) return false;
    const data = (await response.json()) as { ok: boolean; result?: { status?: string } };
    const status = data.result?.status;
    return data.ok && (status === 'creator' || status === 'administrator' || status === 'member');
  } catch {
    return false;
  }
}

async function tgApi(method: string, payload: Record<string, unknown>): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(8000),
    body: JSON.stringify(payload),
  });
  return response.ok;
}

/** Клавиатура выбора периода статистики. */
const STATS_KEYBOARD = {
  inline_keyboard: [
    [
      { text: '2 недели', callback_data: 'stats:14' },
      { text: 'Месяц', callback_data: 'stats:30' },
    ],
    [
      { text: 'Полгода', callback_data: 'stats:182' },
      { text: 'Всё время', callback_data: 'stats:all' },
    ],
  ],
};

/** Клавиатура выбора количества последних лидов. */
const LAST_KEYBOARD = {
  inline_keyboard: [
    [
      { text: '5', callback_data: 'last:5' },
      { text: '10', callback_data: 'last:10' },
      { text: '15', callback_data: 'last:15' },
    ],
  ],
};

const PERIOD_LABELS: Record<string, string> = {
  '14': 'за 2 недели',
  '30': 'за месяц',
  '182': 'за полгода',
  all: 'за всё время',
};

async function reply(
  chatId: number | string,
  text: string,
  replyMarkup?: unknown,
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(8000),
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
      ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    console.error('[telegram] sendMessage НЕ доставлен:', response.status, body.slice(0, 300));
  } else {
    console.log('[telegram] sendMessage отправлен в чат', chatId);
  }
}

/** Запрашивает статистику и отправляет её в чат. */
async function sendStats(
  chatId: number | string,
  days: number | 'all',
  label: string,
): Promise<void> {
  const stats = await fetchStats(days);
  if (!stats?.ok || !stats.counts) {
    await reply(chatId, 'Не удалось получить статистику. Проверьте Google Таблицу.');
    return;
  }
  await reply(chatId, formatStats(label, stats.counts, days === 'all'));
}

interface StatsResult {
  ok: boolean;
  period?: string;
  counts?: Record<string, number>;
}

interface LeadRow {
  date?: string;
  type?: string;
  name?: string;
  phone?: string;
  email?: string;
  program?: string;
  score?: number | string | null;
  profile?: string;
  message?: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

async function fetchLast(count: number): Promise<LeadRow[] | null> {
  const webapp = process.env.GOOGLE_SHEETS_WEBAPP_URL;
  if (!webapp) return null;
  const url = new URL(webapp);
  url.searchParams.set('action', 'last');
  url.searchParams.set('count', String(count));
  const response = await fetch(url.toString(), { signal: AbortSignal.timeout(20000) });
  if (!response.ok) return null;
  const data = (await response.json()) as { ok?: boolean; items?: LeadRow[] };
  return data.ok ? (data.items ?? []) : null;
}

const TYPE_EMOJI: Record<string, string> = {
  application: '🔥',
  quiz_contact: '⭐',
  quiz_result: '📊',
};

function formatLeadDate(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Moscow',
  }).format(d);
}

function formatLast(items: LeadRow[]): string {
  if (items.length === 0) return 'Лидов пока нет.';
  const lines: string[] = [];
  for (const item of items) {
    const emoji = TYPE_EMOJI[item.type ?? ''] ?? '•';
    const date = formatLeadDate(item.date);
    const parts: string[] = [];
    if (item.name) parts.push(escapeHtml(item.name));
    if (item.phone) parts.push(escapeHtml(item.phone));
    if (item.email) parts.push(escapeHtml(item.email));
    if (item.program) parts.push(escapeHtml(item.program));
    if (item.score !== undefined && item.score !== null && item.score !== '') {
      parts.push(`индекс ${item.score}%`);
    }
    if (item.profile) parts.push(escapeHtml(item.profile));
    lines.push(`${emoji} <b>${escapeHtml(date)}</b>`);
    if (parts.length > 0) lines.push(parts.join(' · '));
    if (item.message) {
      const text = item.message.length > 100 ? `${item.message.slice(0, 100)}…` : item.message;
      lines.push(escapeHtml(text));
    }
    lines.push('');
  }
  const text = lines.join('\n').trimEnd();
  return text.length > 3900 ? `${text.slice(0, 3900)}…` : text;
}

async function fetchStats(days: number | 'all'): Promise<StatsResult | null> {
  const webapp = process.env.GOOGLE_SHEETS_WEBAPP_URL;
  if (!webapp) return null;
  const url = new URL(webapp);
  url.searchParams.set('period', days === 'all' ? 'all' : String(days));
  // Apps Script при холодном старте отвечает долго — 20 с, лимит функции 30 с
  const response = await fetch(url.toString(), { signal: AbortSignal.timeout(20000) });
  if (!response.ok) return null;
  return (await response.json()) as StatsResult;
}

function formatStats(label: string, counts: Record<string, number>, withLink = false): string {
  const lines: string[] = [`<b>Статистика ${label}</b>`, ''];
  lines.push(`${TYPE_LABELS.application}: <b>${counts.application ?? 0}</b>`);
  lines.push(`${TYPE_LABELS.quiz_contact}: <b>${counts.quiz_contact ?? 0}</b>`);
  lines.push(`${TYPE_LABELS.quiz_result}: ${counts.quiz_result ?? 0}`);
  lines.push('');
  lines.push(`Всего обращений: <b>${counts.total ?? 0}</b>`);
  if (withLink) lines.push(`<a href="${SHEET_LINK}">Открыть Google Таблицу</a>`);
  return lines.join('\n');
}

const HELP_TEXT = [
  '<b>Команды бота</b>',
  '',
  '/stats — статистика лидов за период',
  '/last — последние лиды: 5, 10 или 15',
].join('\n');

/** Однократная регистрация webhook (вызывается через GET ?action=setup&key=...). */
async function setupWebhook(baseUrl: string): Promise<string> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!token) return 'TELEGRAM_BOT_TOKEN не задан';
  if (!secret) return 'TELEGRAM_WEBHOOK_SECRET не задан';

  const webhookUrl = `${baseUrl}/api/telegram`;
  const result = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(8000),
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: secret,
      allowed_updates: ['message', 'callback_query'],
    }),
  });
  const data = (await result.json()) as { ok: boolean; description?: string };
  if (!data.ok) return `setWebhook ошибка: ${data.description ?? result.status}`;

  await tgApi('setMyCommands', {
    commands: [
      { command: 'stats', description: 'Статистика лидов: /stats неделя|месяц|полгода|всё' },
    ],
  });
  return `Webhook зарегистрирован: ${webhookUrl}`;
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const send = (status: number, data: unknown): void => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  // --- Регистрация webhook ---
  if (req.method === 'GET') {
    const url = new URL(req.url ?? '/', 'https://local');
    if (url.searchParams.get('action') === 'info') {
      if (url.searchParams.get('key') !== process.env.TELEGRAM_WEBHOOK_SECRET) {
        send(403, { ok: false, error: 'forbidden' });
        return;
      }
      const token = process.env.TELEGRAM_BOT_TOKEN;
      if (!token) {
        send(500, { ok: false, error: 'no token' });
        return;
      }
      const r = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`, {
        signal: AbortSignal.timeout(8000),
      });
      send(200, await r.json());
      return;
    }
    if (url.searchParams.get('action') === 'setup') {
      if (url.searchParams.get('key') !== process.env.TELEGRAM_WEBHOOK_SECRET) {
        send(403, { ok: false, error: 'forbidden' });
        return;
      }
      try {
        send(200, { ok: true, result: await setupWebhook('https://www.guzelgaziz.ru') });
      } catch (error) {
        send(500, { ok: false, error: String(error) });
      }
      return;
    }
    send(200, { ok: true, hint: 'POST для webhook, GET ?action=setup&key=... для регистрации' });
    return;
  }

  if (req.method !== 'POST') {
    send(405, { ok: false, error: 'method_not_allowed' });
    return;
  }

  // --- Проверка секрета webhook ---
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const headerSecret = req.headers['x-telegram-bot-api-secret-token'];
  if (secret && headerSecret !== secret) {
    send(403, { ok: false, error: 'forbidden' });
    return;
  }

  // --- Чтение тела ---
  const chunks: Buffer[] = [];
  let raw: string;
  try {
    for await (const chunk of req) chunks.push(chunk as Buffer);
    raw = Buffer.concat(chunks).toString('utf8');
  } catch {
    send(400, { ok: false, error: 'invalid_json' });
    return;
  }

  let update: TgUpdate;
  try {
    update = JSON.parse(raw) as TgUpdate;
  } catch {
    send(400, { ok: false, error: 'invalid_json' });
    return;
  }

  // ВАЖНО: обработка идёт ДО ответа 200 — Vercel обрывает выполнение
  // функции сразу после отправки ответа, поэтому send() только в конце.
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) {
    send(200, { ok: true });
    return;
  }

  try {
    // --- Нажатие inline-кнопки ---
    const cb = update.callback_query;
    if (cb?.id) {
      await tgApi('answerCallbackQuery', { callback_query_id: cb.id });
      const cbChatId = cb.message?.chat?.id;
      const cbFromId = cb.from?.id;
      const allowed =
        cbChatId !== undefined && String(cbChatId) === String(chatId)
          ? true
          : cbFromId !== undefined
            ? await isGroupMember(chatId, cbFromId)
            : false;
      if (allowed && cbChatId !== undefined && typeof cb.data === 'string') {
        const m = /^stats:(\d+|all)$/.exec(cb.data);
        if (m) {
          const key = m[1];
          await sendStats(cbChatId, key === 'all' ? 'all' : Number(key), PERIOD_LABELS[key] ?? '');
        }
        const last = /^last:(\d+)$/.exec(cb.data);
        if (last) {
          const count = Number(last[1]);
          const items = await fetchLast(count);
          await reply(
            cbChatId,
            items === null
              ? 'Не удалось получить список лидов. Проверьте Google Таблицу.'
              : formatLast(items),
          );
        }
      }
      send(200, { ok: true });
      return;
    }

    // --- Обычное сообщение ---
    const msg = update.message;
    if (!msg?.chat?.id || typeof msg.text !== 'string') {
      send(200, { ok: true });
      return;
    }

    // Отвечаем в группе TELEGRAM_CHAT_ID, а в личке — только участникам этой группы
    if (String(msg.chat.id) !== String(chatId)) {
      const fromId = msg.from?.id;
      const allowed =
        msg.chat.type === 'private' && fromId ? await isGroupMember(chatId, fromId) : false;
      if (!allowed) {
        console.log('[telegram] игнор чат', msg.chat.id, 'тип', msg.chat.type);
        send(200, { ok: true });
        return;
      }
    }
    console.log('[telegram] команда:', msg.text, 'из чата', msg.chat.id);

    const text = msg.text.trim();
    if (text === '/start') {
      await reply(msg.chat.id, HELP_TEXT, STATS_KEYBOARD);
    } else if (text === '/last') {
      await reply(msg.chat.id, '<b>Последние лиды</b>\n\nВыберите количество:', LAST_KEYBOARD);
    } else if (text.startsWith('/stats')) {
      const period = PERIODS.find((p) => p.match.test(text));
      if (!period) {
        // без аргумента — показываем кнопки
        await reply(
          msg.chat.id,
          '<b>Статистика лидов</b>\n\nВыберите период:',
          STATS_KEYBOARD,
        );
      } else {
        await sendStats(msg.chat.id, period.days, period.label);
      }
    }
  } catch (error) {
    console.error('[telegram] stats error:', error);
    try {
      await reply(chatId, 'Ошибка при получении статистики.');
    } catch {
      // бот недоступен — лог выше
    }
  }

  send(200, { ok: true });
}
