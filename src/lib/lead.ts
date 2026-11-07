import { collectUtmParams } from '../utils/utm';

/**
 * Отправка лидов (заявки, контакты после теста) в серверный endpoint /api/lead.
 * На Vercel роут обслуживает функцию api/lead.ts (Telegram + Яндекс Формы →
 * Яндекс Таблица). В локальном `vite dev` функции нет: payload логируется
 * в консоль, а отправка считается успешной (dev-режим).
 */

export type LeadType = 'application' | 'quiz_contact' | 'quiz_result';

export interface LeadPayload {
  type: LeadType;
  name?: string;
  email?: string;
  phone?: string;
  program?: string;
  testScore?: number;
  testProfile?: string;
  message?: string;
  page?: string;
  utm?: Record<string, string>;
  timestamp?: string;
}

export async function sendLead(payload: LeadPayload): Promise<void> {
  const body: LeadPayload = {
    ...payload,
    page: payload.page ?? window.location.pathname,
    timestamp: payload.timestamp ?? new Date().toISOString(),
    utm: payload.utm ?? collectUtmParams(),
  };

  const response = await fetch('/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  if (!response.ok || !isJson) {
    if (import.meta.env.DEV) {
      // Локальный vite dev не обслуживает api/lead — имитируем успех с логом
      console.warn('[lead] Серверный endpoint недоступен (vite dev). Payload:', body);
      return;
    }
    throw new Error(`Lead endpoint error: ${response.status}`);
  }

  const data = (await response.json()) as { ok?: boolean };
  if (!data.ok) throw new Error('Lead endpoint rejected payload');
}
