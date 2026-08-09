/**
 * PRF Design System v1.0 — источник истины.
 *
 * Канон — shop (docs/shop, перенесён в web/app/globals.css). Значения здесь
 * должны быть побайтово синхронны с shop `:root`, а не согласованы —
 * office подстраивается под них, не наоборот.
 *
 * Экспортируется как обычный TS-объект (не CSS), потому что mobile
 * (Expo/React Native) не умеет в CSS custom properties вообще: RN нужны
 * значения как есть, JS-объектом. `scripts/tokens.mjs` генерирует из этого
 * файла `styles/tokens.css` для office/web/pos — руками `tokens.css` не
 * редактируется.
 *
 * Только erasable syntax (без `enum`/`namespace`) — Node читает этот файл
 * напрямую через `--experimental-strip-types`, без сборки.
 */

export const colors = {
  black: '#111111',
  grayDark: '#2b2b2b',
  grayMid: '#6b7280',
  grayLight: '#f2f2f2',
  yellow: '#ffc107',
  // Не было в shop (только у office) — стало каноническим, когда на него
  // понадобилась ссылка из table.css (ховер ручки ресайза колонки).
  yellowDark: '#ffa000',
  white: '#ffffff',
  line: '#e5e7eb',

  // Цвета отделов каталога (shop)
  deptKrepezh: '#f97316',
  deptElektrika: '#facc15',
  deptInstrument: '#2563eb',
  deptSanteh: '#8b5cf6',
  deptStroymat: '#ef4444',
  deptOtdelka: '#22c55e',
  deptHoz: '#06b6d4',
  deptAkcii: '#6b7280',

  // Статусы
  ok: '#22c55e',
  warn: '#facc15',
  danger: '#ef4444',
} as const

export const radius = {
  sm: 8,
  md: 12,
} as const

// CSS-строки для web (box-shadow) — RN-эквивалент см. elevation ниже.
export const shadow = {
  card: '0 10px 30px -18px rgba(17, 17, 17, 0.35)',
  lift: '0 16px 40px -20px rgba(17, 17, 17, 0.45)',
} as const

// Тот же подъём, что shadow.card/lift, но как отдельные поля для
// React Native (StyleSheet не понимает CSS box-shadow строкой).
export const elevation = {
  card: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 6,
  },
  lift: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
} as const

export const tokens = { colors, radius, shadow, elevation } as const

export type Tokens = typeof tokens
