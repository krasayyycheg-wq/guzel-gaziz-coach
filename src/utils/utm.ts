/**
 * Сбор UTM-меток.
 * Метки с посадочной страницы сохраняются в localStorage и подмешиваются
 * ко всем последующим заявкам, даже если форма заполнена на другой странице.
 */

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
const STORAGE_KEY = 'lead_utm';

/** Сохранить UTM из текущего URL (вызывается при первом входе на сайт). */
export function captureUtmFromUrl(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    UTM_KEYS.forEach((key) => {
      const value = params.get(key);
      if (value) utm[key] = value.slice(0, 300);
    });
    if (Object.keys(utm).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
    }
  } catch {
    // localStorage недоступен — просто игнорируем
  }
}

/** Текущие UTM: сохранённые ранее + из текущего URL (URL приоритетнее). */
export function collectUtmParams(): Record<string, string> {
  let stored: Record<string, string> = {};
  try {
    stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    stored = {};
  }

  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = { ...stored };
  UTM_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) utm[key] = value.slice(0, 300);
  });
  return utm;
}
