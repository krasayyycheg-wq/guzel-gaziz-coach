import type { IncomingMessage, ServerResponse } from 'http';
import { z } from 'zod';

/**
 * Приём заявок и результатов теста.
 *
 * Роутинг: POST /api/lead (Vercel Serverless Function).
 *
 * Доставка:
 *  1. Telegram — сообщение в чат/группу коуча (TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID).
 *  2. Яндекс Таблицы — официального write-API у Яндекс Таблиц нет, поэтому
 *     используется официальный API Яндекс Форм: ответ программно добавляется
 *     в форму (POST /forms/{id}/responses), которая связана с Яндекс Таблицей
 *     (в настройках формы: «Ответы» → связать с таблицей). Требуются
 *     YANDEX_FORMS_OAUTH_TOKEN и YANDEX_FORMS_FORM_ID.
 *  3. Google Таблицы — через веб-приложение Google Apps Script
 *     (GOOGLE_SHEETS_WEBAPP_URL, URL вида .../exec).
 *
 * Все доставки опциональны: если переменные не заданы, функция отвечает 200
 * с delivered: { ...: false }, а лид пишется в лог функции (Vercel → Logs),
 * чтобы ничего не терялось беззвучно.
 */

const leadSchema = z.object({
  type: z.enum(['application', 'quiz_contact', 'quiz_result']),
  name: z.string().max(100).optional(),
  email: z.string().email().max(200).optional(),
  phone: z.string().max(30).optional(),
  program: z.string().max(100).optional(),
  testScore: z.number().int().min(0).max(100).optional(),
  testProfile: z.string().max(200).optional(),
  message: z.string().max(3000).optional(),
  page: z.string().max(300).optional(),
  utm: z.record(z.string(), z.string().max(300)).optional(),
  timestamp: z.string().max(50).optional(),
});

type Lead = z.infer<typeof leadSchema>;

const PROGRAM_LABELS: Record<string, string> = {
  'life-strategy': 'Личная стратегия развития',
  'public-speaking': 'Публичные выступления',
  general: 'Общая заявка',
};

const TYPE_LABELS: Record<Lead['type'], string> = {
  application: '🔥 <b>ЗАЯВКА НА ПРОГРАММУ</b>',
  quiz_contact: '⭐ <b>ЛИД С ТЕСТА</b>',
  quiz_result: '📊 Результат теста',
};

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function formatTelegramMessage(lead: Lead): string {
  const lines: string[] = [];
  lines.push(TYPE_LABELS[lead.type]);

  if (lead.name) lines.push(`Имя: ${escapeHtml(lead.name)}`);
  if (lead.email) lines.push(`Email: ${escapeHtml(lead.email)}`);
  if (lead.phone) lines.push(`Телефон: ${escapeHtml(lead.phone)}`);
  if (lead.program) {
    lines.push(`Программа: ${escapeHtml(PROGRAM_LABELS[lead.program] ?? lead.program)}`);
  }
  if (lead.testScore !== undefined) lines.push(`Индекс владения жизнью: ${lead.testScore}%`);
  if (lead.testProfile) lines.push(`Профиль: ${escapeHtml(lead.testProfile)}`);
  if (lead.message) lines.push(`Сообщение: ${escapeHtml(lead.message)}`);

  lines.push(
    `Страница: ${escapeHtml(lead.page ?? '—')} · ${escapeHtml(
      lead.timestamp ?? new Date().toISOString(),
    )}`,
  );

  const utm = Object.entries(lead.utm ?? {});
  if (utm.length > 0) {
    lines.push(`UTM: ${utm.map(([k, v]) => `${k}=${escapeHtml(v)}`).join(', ')}`);
  }

  return lines.join('\n');
}

/** Плоский текст лида для Яндекс Форм (одно поле «Данные заявки»). */
function formatPlainText(lead: Lead): string {
  return formatTelegramMessage(lead)
    .replaceAll(/<\/?b>/g, '')
    .replaceAll(/&amp;/g, '&')
    .replaceAll(/&lt;/g, '<')
    .replaceAll(/&gt;/g, '>')
    .replaceAll(/&quot;/g, '"');
}

async function sendTelegram(text: string, sheetRow?: number): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(8000),
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...(sheetRow
        ? {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '✅ Отработан', callback_data: `done:${sheetRow}` },
                  { text: '⏳ Позже', callback_data: `later:${sheetRow}` },
                ],
              ],
            },
          }
        : {}),
    }),
  });
  return response.ok;
}

interface YandexFormQuestion {
  id?: string;
  label?: { question?: string };
}

/**
 * Добавляет ответ в Яндекс Форму, связанную с Яндекс Таблицей.
 * В форме должно быть одно текстовое поле с вопросом, содержащим
 * «заявка» / «данные» / «лид» (иначе берётся первый вопрос формы).
 */
async function sendToYandexForms(text: string): Promise<boolean> {
  const token = process.env.YANDEX_FORMS_OAUTH_TOKEN;
  const formId = process.env.YANDEX_FORMS_FORM_ID;
  if (!token || !formId) return false;

  const base = `https://forms.yandex.net/api/v1/forms/${formId}`;
  const auth = { Authorization: `OAuth ${token}` };

  const formResponse = await fetch(base, { headers: auth, signal: AbortSignal.timeout(8000) });
  if (!formResponse.ok) {
    console.error('[lead] Yandex Forms: не удалось получить структуру формы', formResponse.status);
    return false;
  }
  const form = (await formResponse.json()) as { questions?: YandexFormQuestion[] };
  const questions = form.questions ?? [];
  if (questions.length === 0) return false;

  const target =
    questions.find((q) => /заявк|данн|лид/i.test(q.label?.question ?? '')) ?? questions[0];
  if (!target.id) return false;

  const importResponse = await fetch(`${base}/responses`, {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(8000),
    body: JSON.stringify({ data: { [target.id]: { value: [text] } } }),
  });
  if (!importResponse.ok) {
    console.error('[lead] Yandex Forms: не удалось добавить ответ', importResponse.status);
    return false;
  }
  return true;
}

/**
 * Добавляет строку лида в Google Таблицу через опубликованное
 * веб-приложение Google Apps Script (doPost + appendRow).
 * Требуется переменная GOOGLE_SHEETS_WEBAPP_URL (URL вида .../exec).
 */
async function sendToGoogleSheets(lead: Lead): Promise<{ ok: boolean; row?: number }> {
  const url = process.env.GOOGLE_SHEETS_WEBAPP_URL;
  if (!url) return { ok: false };

  // Кириллица портится на уровне платформы Apps Script при любом
  // текстовом формате, поэтому данные идут в base64 (чистый ASCII),
  // а UTF-8 восстанавливается уже внутри скрипта.
  const payload = Buffer.from(JSON.stringify(lead), 'utf8').toString('base64');
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    signal: AbortSignal.timeout(8000),
    body: `data=${payload}`,
  });
  if (!response.ok) return { ok: false };
  const data = (await response.json()) as { ok?: boolean; row?: number };
  return { ok: data.ok === true, row: typeof data.row === 'number' ? data.row : undefined };
}

/**
 * Классическая Node.js-сигнатура (IncomingMessage/ServerResponse) —
 * гарантированно поддерживается Vercel Node Runtime и не зависит
 * от автоопределения Web API.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const send = (status: number, data: unknown): void => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  if (req.method !== 'POST') {
    send(405, { ok: false, error: 'method_not_allowed' });
    return;
  }

  const chunks: Buffer[] = [];
  let raw: string;
  try {
    for await (const chunk of req) chunks.push(chunk as Buffer);
    raw = Buffer.concat(chunks).toString('utf8');
  } catch {
    send(400, { ok: false, error: 'invalid_json' });
    return;
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    send(400, { ok: false, error: 'invalid_json' });
    return;
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    send(422, { ok: false, error: 'invalid_payload' });
    return;
  }
  const lead = parsed.data;

  const telegramText = formatTelegramMessage(lead);
  const plainText = formatPlainText(lead);

  const delivered = { telegram: false, yandex_forms: false, google_sheets: false };

  // Сначала таблица — она возвращает номер строки для кнопок статуса,
  // затем Telegram с кнопками «Связался / Позже».
  let sheetRow: number | undefined;
  try {
    const sheets = await sendToGoogleSheets(lead);
    delivered.google_sheets = sheets.ok;
    sheetRow = sheets.row;
  } catch (error) {
    console.error('[lead] Google Sheets delivery error:', error);
  }

  try {
    delivered.telegram = await sendTelegram(telegramText, sheetRow);
  } catch (error) {
    console.error('[lead] Telegram delivery error:', error);
  }

  try {
    delivered.yandex_forms = await sendToYandexForms(plainText);
  } catch (error) {
    console.error('[lead] Yandex Forms delivery error:', error);
  }

  if (!delivered.telegram && !delivered.yandex_forms && !delivered.google_sheets) {
    // Ни один канал не настроен — лид остаётся в логах функции
    console.warn('[lead] Получен лид, но каналы доставки не настроены:', plainText);
  }

  send(200, { ok: true, delivered });
}
