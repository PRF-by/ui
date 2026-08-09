# @prf/ui

Общая дизайн-система ПРОФ+: токены + компоненты для `office`, `web`, `pos` и
(токены) `mobile`. **Канон — shop** (`PRF-by/web`) — это уже оформленный
и названный «PRF Design System v1.0», обращённый к покупателям. `office`
подстраивается под него: раздельными остаются только структурные/плотностные
паттерны админки (сайдбар, drawer, компактные таблицы), а не цвет/скин.

Полный план и обоснование решений — в plan-файле сессии, где создавался этот
репозиторий; здесь фиксируется только то, что нужно для повседневной работы.

## Почему репозиторий публичный

`office`/`web` собираются в Docker на базе `node:22-slim`, в котором нет
`git`. `npm ci` резолвит git-зависимость по SHA из lock-файла через
`codeload.github.com` по HTTPS **без git**, но только если репозиторий
публичный — для приватного codeload отдаёт 401, npm откатывается на
`git clone`, а git в образе отсутствует: ломается и CI, и ручной деплой
office. Альтернатива (git в образе + SSH-агент на раннерах) — это ровно та
инфраструктура, ради отказа от которой выбирался git-dependency вместо
приватного npm-registry. Содержимое пакета — цвета/отступы/разметка, ничего
чувствительного (prf.by и так отдаёт этот CSS публично).

## Установка в приложении-потребителе

```jsonc
// package.json
"dependencies": {
  "@prf/ui": "github:PRF-by/ui#v0.1.0"
}
```

```js
// next.config.mjs
const nextConfig = {
  transpilePackages: ['@prf/ui'], // пакет отдаёт исходный TSX, не сборку
}
```

```tsx
// app/layout.tsx — порядок импорта важен: сначала пакет, потом свои стили
import '@prf/ui/styles.css'
import './globals.css'
```

Обновление версии — явная правка тега в `package.json` + `npm install` +
коммит `package-lock.json`. Никаких автообновлений: `npm ci` пинится на SHA
из lock-файла, бамп — осознанное действие, видно в диффе PR.

## Локальная разработка

`npm link`, не `file:`-зависимость и не tsconfig `paths` (последнее упирается
в открытый баг Turbopack при резолве `paths` → `exports` для пакетов из
`node_modules` — next.js/issues/85315):

```sh
cd ui && npm link
cd ../office && npm link @prf/ui   # или ../web
# ...правите ui, office сразу видит правки через symlink...
npm ci                              # перед коммитом — вернуть git-зависимость
```

## Токены

`src/tokens.ts` — источник истины (обычный TS-объект, не CSS: mobile/React
Native не умеет в CSS custom properties). `src/styles/tokens.css`
генерируется из него:

```sh
npm run tokens          # перегенерировать после правки tokens.ts
npm run check           # tokens --check + typecheck + prettier — прогоняется в CI
```

`tokens.css` **закоммичен** — у пакета нет `prepare`/`build`-хука (см. ниже,
почему), поэтому у потребителя генератор никогда не запускается сам.

## Почему в package.json нет `build`/`prepare`/`postinstall`/`workspaces`

npm запускает lifecycle-хуки пакета при установке — включая быстрый путь
через codeload-тарбол, не только при `git clone`. Наличие любого из этих
полей тихо превращает каждый `npm ci` у каждого потребителя во вложенный
`npm install` во временной директории. Генератор токенов поэтому называется
`tokens`, не `build`.

## Структура

```
src/
  tokens.ts        ← источник истины (TS-объект)
  UiSprite.tsx      ← общий спрайт иконок, монтируется в layout потребителя
  components/       ← Button, Panel, Field, Badge, DataTable, Drawer, ...
  styles/
    tokens.css      ← сгенерирован, не редактировать руками
    index.css       ← точка входа, импортируется потребителем
scripts/tokens.mjs  ← генератор tokens.ts → tokens.css
```
