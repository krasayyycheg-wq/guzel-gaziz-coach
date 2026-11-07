import type { IncomingMessage, ServerResponse } from 'http';
import { reply, fetchStats, formatStats, formatLast, SHOW_KEYBOARD } from './telegram';
import type { LeadRow } from './telegram';

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
 */

async function fetchPending(): Promise<LeadRow[] | null> {
  const webapp = process.env.GOOGLE_SHEETS_WEBAPP_URL;
  if (!webapp) return null;
  const url = new URL(webapp);
  url.searchParams.set('action', 'pending');
  const response = await fetch(url.toString(), { signal: AbortSignal.timeout(20000) });
  if (!response.ok) return null;
  const data = (await response.json()) as { ok?: boolean; items?: LeadRow[] };
  return data.ok ? (data.items ?? []) : null;
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
      const stats = await fetchStats(7);
      if (!stats?.ok || !stats.counts) {
        send(500, { ok: false, error: 'stats_unavailable' });
        return;
      }
      await reply(
        chatId,
        `📅 <b>Еженедельная сводка</b>\n\n${formatStats('за неделю', stats.counts)}`,
        SHOW_KEYBOARD,
      );
      send(200, { ok: true, job });
      return;
    }

    // job=reminders — заявки без ответа больше суток
    const items = await fetchPending();
    if (items === null) {
      send(500, { ok: false, error: 'pending_unavailable' });
      return;
    }
    if (items.length === 0) {
      // Всё обработано — не спамим
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
