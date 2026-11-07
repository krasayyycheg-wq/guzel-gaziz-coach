import type { IncomingMessage, ServerResponse } from 'http';

/**
 * Автоматика по расписанию (Vercel Cron).
 *
 * Расписания (vercel.json):
 *  - reminders: каждый день в 09:00 МСК — заявки без ответа больше суток
 *  - weekly:    понедельник 09:00 МСК — сводка за неделю
 *
 * Ручной запуск (для проверки):
 *  GET /api/cron?job=reminders&key=<TELEGRAM_WEBHOOK_SECRET>
 *  GET /api/cron?job=weekly&key=<TELEGRAM_WEBHOOK_SECRET>
 *
 * Функция самодостаточна (без импортов из других api-файлов).
 */

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
  status?: string;
}

const TYPE_LABELS: Record<string, string> = {
  application: '🔥 Заявки на программу',
  quiz_contact: '⭐ Лиды с теста',
  quiz_result: '📊 Результаты теста',
};

const TYPE_EMOJI: Record<string, string> = {
  application: '🔥',
  quiz_contact: '⭐',
  quiz_result: '📊',
};

const SHOW_KEYBOARD = {
  inline_keyboard: [
    [{ text: 'Показать заявки', callback_data: 'list:application' }],
    [{ text: 'Показать лидов с теста', callback_data: 'list:quiz_contact' }],
    [{ text: 'Показать результаты теста', callback_data: 'list:quiz_result' }],
  ],
};

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

async function reply(chatId: number | string, text: string, replyMarkup?: unknown): Promise<void> {
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
    console.error('[cron] sendMessage:', response.status, (await response.text()).slice(0, 200));
  }
}

async function scriptGet(params: Record<string, string>): Promise<Record<string, unknown> | null> {
  const webapp = process.env.GOOGLE_SHEETS_WEBAPP_URL;
  if (!webapp) return null;
  const url = new URL(webapp);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const response = await fetch(url.toString(), { signal: AbortSignal.timeout(20000) });
  if (!response.ok) return null;
  return (await response.json()) as Record<string, unknown>;
}

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
    if (item.status) lines.push(`Статус: ${escapeHtml(item.status)}`);
    lines.push('');
  }
  const text = lines.join('\n').trimEnd();
  return text.length > 3900 ? `${text.slice(0, 3900)}…` : text;
}

function formatStats(label: string, counts: Record<string, number>): string {
  const lines: string[] = [`<b>Статистика ${label}</b>`, ''];
  lines.push(`${TYPE_LABELS.application}: <b>${counts.application ?? 0}</b>`);
  lines.push(`${TYPE_LABELS.quiz_contact}: <b>${counts.quiz_contact ?? 0}</b>`);
  lines.push(`${TYPE_LABELS.quiz_result}: ${counts.quiz_result ?? 0}`);
  lines.push('');
  lines.push(`Всего обращений: <b>${counts.total ?? 0}</b>`);
  return lines.join('\n');
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const send = (status: number, data: unknown): void => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  if (req.method !== 'GET') {
    send(405, { ok: false, error: 'method_not_allowed' });
    return;
  }

  const url = new URL(req.url ?? '/', 'https://local');
  const isVercelCron = (req.headers['user-agent'] ?? '').startsWith('vercel-cron');
  const keyOk = url.searchParams.get('key') === process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!isVercelCron && !keyOk) {
    send(403, { ok: false, error: 'forbidden' });
    return;
  }

  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) {
    send(500, { ok: false, error: 'TELEGRAM_CHAT_ID не задан' });
    return;
  }

  const job = url.searchParams.get('job') ?? 'reminders';

  try {
    if (job === 'weekly') {
      const stats = await scriptGet({ period: '7' });
      const counts = stats?.counts as Record<string, number> | undefined;
      if (!stats?.ok || !counts) {
        send(500, { ok: false, error: 'stats_unavailable' });
        return;
      }
      await reply(
        chatId,
        `📅 <b>Еженедельная сводка</b>\n\n${formatStats('за неделю', counts)}`,
        SHOW_KEYBOARD,
      );
      send(200, { ok: true, job });
      return;
    }

    // job=reminders — заявки без ответа больше суток
    const data = await scriptGet({ action: 'pending' });
    const items = data?.items as LeadRow[] | undefined;
    if (!data?.ok || !items) {
      send(500, { ok: false, error: 'pending_unavailable' });
      return;
    }
    if (items.length === 0) {
      send(200, { ok: true, job, pending: 0 });
      return;
    }
    await reply(
      chatId,
      `⏰ <b>Заявки без ответа больше суток: ${items.length}</b>\n\n${formatLast(items)}`,
    );
    send(200, { ok: true, job, pending: items.length });
  } catch (error) {
    console.error('[cron] error:', error);
    send(500, { ok: false, error: String(error) });
  }
}
