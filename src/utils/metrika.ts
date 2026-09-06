/**
 * Яндекс.Метрика.
 * Счётчик загружается ТОЛЬКО после согласия пользователя в cookie-баннере
 * (localStorage 'cookie_consent' === 'all'). В index.html сниппет не вставляется.
 */

// TODO: указать ID счётчика
export const YANDEX_METRIKA_ID = 0;

const METRIKA_SRC = 'https://mc.yandex.ru/metrika/tag.js';

type MetrikaQueue = {
  (...args: unknown[]): void;
  a?: unknown[][];
  l?: number;
};

declare global {
  interface Window {
    ym?: MetrikaQueue;
  }
}

/**
 * Динамически вставляет стандартный сниппет Яндекс.Метрики.
 * Повторный вызов безопасен: при уже загруженном счётчике ничего не делает.
 */
export function loadMetrika(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (!YANDEX_METRIKA_ID) {
    // ID счётчика не задан — Метрика не загружается
    return;
  }
  if (window.ym) return; // уже инициализирована

  // Стандартный сниппет:
  // (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  // m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],
  // k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script',
  // 'https://mc.yandex.ru/metrika/tag.js','ym');
  const ym: MetrikaQueue = ((...args: unknown[]) => {
    (ym.a = ym.a || []).push(args);
  }) as MetrikaQueue;
  ym.l = Date.now();
  window.ym = ym;

  const alreadyInserted = Array.from(document.scripts).some((s) => s.src === METRIKA_SRC);
  if (!alreadyInserted) {
    const script = document.createElement('script');
    script.async = true;
    script.src = METRIKA_SRC;
    const first = document.getElementsByTagName('script')[0];
    if (first?.parentNode) {
      first.parentNode.insertBefore(script, first);
    } else {
      document.head.appendChild(script);
    }
  }

  window.ym(YANDEX_METRIKA_ID, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true,
  });
}
