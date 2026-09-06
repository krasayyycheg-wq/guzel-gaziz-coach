export interface ProgramInfo {
  slug: string;
  badge: string;
  title: string;
  audience: string;
  result: string;
  format: string;
  type: 'individual' | 'group';
  testSlug?: string;
}

export const PROGRAMS: ProgramInfo[] = [
  {
    slug: 'life-strategy',
    badge: 'Программа трансформации',
    title: 'Личная стратегия развития',
    audience:
      'Для руководителей и профессионалов, которые чувствуют, что живут «по чужому ТЗ», и хотят вернуть себе авторство собственной жизни.',
    result:
      'Персональная стратегия развития на основе ваших сильных сторон, ценностей и образа будущего — с конкретным планом действий.',
    format: '5 индивидуальных сессий · онлайн или очно',
    type: 'individual',
    testSlug: '/test/life-ownership-index',
  },
  {
    slug: 'public-speaking',
    badge: 'Курс ораторского мастерства',
    title: 'Публичные выступления',
    audience:
      'Для тех, кто хочет уверенно выступать перед любой аудиторией: на совещаниях, конференциях и публичных площадках.',
    result:
      'Уверенность на сцене, убедительная подача идей и умение вовлекать аудиторию в диалог.',
    format: '5 модулей · практика на реальных выступлениях',
    type: 'group',
    testSlug: '/test/life-ownership-index',
  },
];
