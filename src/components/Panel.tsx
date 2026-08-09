'use client'

import { type ReactNode, useEffect, useState } from 'react'

/**
 * Панель со сворачиванием. Перенесена из office/components/Panel.tsx
 * почти дословно (структура/поведение не меняются при переносе в пакет,
 * только скин через токены/CSS-классы).
 *
 * Содержимое скрывается атрибутом hidden, а не выбрасывается из дерева:
 * поля свёрнутой панели остаются в форме и уезжают при сохранении. Если
 * их размонтировать, PATCH уйдёт без них и молча затрёт значения в базе.
 *
 * Начальное значение open — из пропса, а не localStorage: чтение
 * хранилища при первом рендере расходится с серверной разметкой и ловит
 * hydration mismatch. Настоящее состояние подхватывается сразу после,
 * в useEffect.
 */

const STORE = 'prf.panels'

function readState(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORE)
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {}
  } catch {
    return {}
  }
}

export function Panel({
  id,
  title,
  hint,
  extra,
  defaultOpen = true,
  collapsible = true,
  children,
}: {
  /** Ключ запоминания состояния. Разные экраны — разные ключи. */
  id: string
  title: string
  hint?: string
  /** Кнопка в шапке панели, например «Заполнить по названию». */
  extra?: ReactNode
  defaultOpen?: boolean
  collapsible?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  useEffect(() => {
    const saved = readState()[id]
    if (typeof saved === 'boolean') setOpen(saved)
  }, [id])

  const toggle = () => {
    const next = !open
    setOpen(next)
    try {
      localStorage.setItem(STORE, JSON.stringify({ ...readState(), [id]: next }))
    } catch {
      // Приватный режим или переполненное хранилище — сворачивать всё
      // равно можно, просто не запомнится.
    }
  }

  return (
    <section className={open ? 'panel' : 'panel panel--closed'}>
      <div
        className="panel__head"
        onClick={(e) => {
          if (!collapsible) return
          if ((e.target as HTMLElement).closest('button, a, input, select')) return
          toggle()
        }}
        style={collapsible ? { cursor: 'pointer' } : undefined}
      >
        <h2>{title}</h2>
        {hint && <span className="caption">{hint}</span>}
        {extra}
        {collapsible && (
          <button
            className="ibtn"
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-label={open ? `Свернуть «${title}»` : `Развернуть «${title}»`}
            style={{ marginLeft: 'auto' }}
          >
            <svg className={open ? 'chev chev--open' : 'chev'}>
              <use href="#i-chevron-down" />
            </svg>
          </button>
        )}
      </div>
      <div hidden={!open}>{children}</div>
    </section>
  )
}
