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

async function reply(chatId: number | string, text: string): Promise<void> {
  await tgApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: false,
  });
}

interface StatsResult {
  ok: boolean;
  period?: string;
  counts?: Record<string, number>;
}

async function fetchStats(days: number | 'all'): Promise<StatsResult | null> {
  const webapp = process.env.GOOGLE_SHEETS_WEBAPP_URL;
  if (!webapp) return null;
  const url = new URL(webapp);
  url.searchParams.set('period', days === 'all' ? 'all' : String(days));
  const response = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
  if (!response.ok) return null;
  return (await response.json()) as StatsResult;
}

function formatStats(label: string, counts: Record<string, number>): string {
  const lines: string[] = [`<b>Статистика ${label}</b>`, ''];
  lines.push(`${TYPE_LABELS.application}: <b>${counts.application ?? 0}</b>`);
  lines.push(`${TYPE_LABELS.quiz_contact}: <b>${counts.quiz_contact ?? 0}</b>`);
  lines.push(`${TYPE_LABELS.quiz_result}: ${counts.quiz_result ?? 0}`);
  lines.push('');
  lines.push(`Всего обращений: <b>${counts.total ?? 0}</b>`);
  lines.push(`<a href="${SHEET_LINK}">Открыть Google Таблицу</a>`);
  return lines.join('\n');
}

const HELP_TEXT = [
  '<b>Команды статистики лидов</b>',
  '',
  '/stats — за месяц (по умолчанию)',
  '/stats неделя — за 2 недели',
  '/stats месяц — за месяц',
  '/stats полгода — за полгода',
  '/stats всё — за всё время',
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
      allowed_updates: ['message'],
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

  // Telegram ждёт быстрый 200 — отвечаем сразу, обработку делаем до return
  send(200, { ok: true });

  const msg = update.message;
  if (!msg?.chat?.id || typeof msg.text !== 'string') return;

  // Отвечаем в группе TELEGRAM_CHAT_ID, а в личке — только участникам этой группы
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) return;
  if (String(msg.chat.id) !== String(chatId)) {
    const fromId = msg.from?.id;
    if (msg.chat.type === 'private' && fromId && (await isGroupMember(chatId, fromId))) {
      // личка владельца/участника группы — разрешено
    } else {
      console.log('[telegram] игнор чат', msg.chat.id, 'тип', msg.chat.type);
      return;
    }
  }
  console.log('[telegram] команда:', msg.text, 'из чата', msg.chat.id);

  const text = msg.text.trim();
  if (text === '/start') {
    await reply(msg.chat.id, HELP_TEXT);
    return;
  }
  if (!text.startsWith('/stats')) return;

  const period = PERIODS.find((p) => p.match.test(text));
  const days = period?.days ?? 30;
  const label = period?.label ?? 'за месяц';

  try {
    const stats = await fetchStats(days);
    if (!stats?.ok || !stats.counts) {
      await reply(msg.chat.id, 'Не удалось получить статистику. Проверьте Google Таблицу.');
      return;
    }
    await reply(msg.chat.id, formatStats(label, stats.counts));
  } catch (error) {
    console.error('[telegram] stats error:', error);
    await reply(msg.chat.id, 'Ошибка при получении статистики.');
  }
}
