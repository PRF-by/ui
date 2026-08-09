#!/usr/bin/env node
// Генерирует src/styles/tokens.css из src/tokens.ts. Запуск: `node
// scripts/tokens.mjs` (перезаписать) или `node scripts/tokens.mjs --check`
// (упасть с кодом 1, если сгенерированный файл разошёлся с закоммиченным —
// используется в CI, чтобы поймать ручную правку tokens.css).
//
// Node ≥22 читает .ts напрямую (--experimental-strip-types по умолчанию) —
// без сборки, без ts-node.

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { colors, radius, shadow } from '../src/tokens.ts'

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

function cssVars(obj, unit = '') {
  return Object.entries(obj)
    .map(([key, value]) => `  --${kebab(key)}: ${value}${unit};`)
    .join('\n')
}

// radius.md выходит как bare --radius (не --radius-md) — так уже называется
// в ~5700 строках существующего CSS обоих приложений, менять не наш выбор.
const radiusCss = [`  --radius: ${radius.md}px;`, `  --radius-sm: ${radius.sm}px;`].join('\n')

const generated = `/* СГЕНЕРИРОВАНО из src/tokens.ts — не редактировать руками.
   Правка: src/tokens.ts, затем \`node scripts/tokens.mjs\`. */

:root {
${cssVars(colors)}

${radiusCss}

  --shadow: ${shadow.card};
  --shadow-lift: ${shadow.lift};
}
`

// Алиасы под легаси-имена office — временный мост на период миграции
// (см. docs/decisions в PRF-by/docs). Не часть канонических токенов,
// поэтому не в tokens.ts: это костыль per office/globals.css, а не
// дизайн-значение, которое должно попасть в mobile.
const compat = `
/* Легаси-имена office — удалить, когда office/globals.css перестанет
   на них ссылаться (см. план миграции office на @prf/ui). */
:root {
  --bad: var(--danger);
  --bg: #f6f6f4;
}
`

const output = generated + compat
const outPath = fileURLToPath(new URL('../src/styles/tokens.css', import.meta.url))

if (process.argv.includes('--check')) {
  const current = readFileSync(outPath, 'utf8')
  if (current !== output) {
    console.error('tokens.css устарел относительно tokens.ts — запустите `node scripts/tokens.mjs`')
    process.exit(1)
  }
  console.log('tokens.css в актуальном состоянии')
} else {
  writeFileSync(outPath, output)
  console.log(`Записано: ${outPath}`)
}
