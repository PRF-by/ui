'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

export interface Column {
  key: string
  label: string
  numeric?: boolean
  sortable?: boolean
  /** Начальная ширина в пикселях — на первой отрисовке, дальше её решает пользователь. */
  defaultWidth?: number
  /** Без ручки растягивания — обычно последняя колонка (действия) или узкая служебная. */
  fixed?: boolean
}

export type SortDir = 'asc' | 'desc'

function loadWidths(key: string): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(`prf_tw:${key}`) ?? '{}')
  } catch {
    return {}
  }
}
function saveWidths(key: string, widths: Record<string, number>) {
  try {
    localStorage.setItem(`prf_tw:${key}`, JSON.stringify(widths))
  } catch {
    // приватный режим/квота — просто не запомнится
  }
}

/**
 * Заголовок таблицы с сортировкой по клику и растягиванием колонок мышью.
 * Тело таблицы (<tbody>) остаётся своим у каждой страницы — строки
 * слишком разные, чтобы обобщать, а вот шапка — одна и та же логика
 * везде.
 *
 * Ширины меряются из реального рендера при первом монтировании (не
 * угадываются заранее) и запоминаются в localStorage по storageKey — так
 * у каждой таблицы своя раскладка, и она не потеряется при следующем визите.
 */
export function ResizableHead({
  storageKey,
  columns,
  leading,
  sort,
  dir,
  onSort,
}: {
  storageKey: string
  columns: Column[]
  /** Доп. ячейка(и) перед колонками из columns — обычно чекбокс «выбрать все». */
  leading?: ReactNode
  sort?: string
  dir?: SortDir
  onSort?: (key: string) => void
}) {
  const [widths, setWidths] = useState<Record<string, number>>({})
  const thRefs = useRef<Record<string, HTMLTableCellElement | null>>({})
  const dragRef = useRef<{ key: string; startX: number; startWidth: number } | null>(null)

  useEffect(() => {
    setWidths(loadWidths(storageKey))
  }, [storageKey])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current
      if (!d) return
      const next = Math.max(56, d.startWidth + (e.clientX - d.startX))
      const th = thRefs.current[d.key]
      if (th) th.style.width = `${next}px`
    }
    const onUp = () => {
      const d = dragRef.current
      if (!d) return
      const th = thRefs.current[d.key]
      const w = th ? Math.round(th.getBoundingClientRect().width) : d.startWidth
      dragRef.current = null
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      setWidths((prev) => {
        const next = { ...prev, [d.key]: w }
        saveWidths(storageKey, next)
        return next
      })
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [storageKey])

  return (
    <thead>
      <tr>
        {leading}
        {columns.map((col) => {
          const width = widths[col.key] ?? col.defaultWidth
          const label = col.sortable ? (
            <button
              type="button"
              className={`th-sort${sort === col.key ? ' on' : ''}`}
              onClick={() => onSort?.(col.key)}
            >
              {col.label}
              <svg className={`th-sort__arrow${sort === col.key && dir === 'desc' ? ' desc' : ''}`}>
                <use href="#i-chevron-down" />
              </svg>
            </button>
          ) : (
            col.label
          )
          return (
            <th
              key={col.key}
              ref={(el) => {
                thRefs.current[col.key] = el
              }}
              className={col.numeric ? 'num' : undefined}
              style={width ? { width } : undefined}
            >
              {label}
              {!col.fixed && (
                <span
                  className="th-resize"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    const th = thRefs.current[col.key]
                    dragRef.current = {
                      key: col.key,
                      startX: e.clientX,
                      startWidth: th?.getBoundingClientRect().width ?? col.defaultWidth ?? 120,
                    }
                    document.body.style.cursor = 'col-resize'
                    document.body.style.userSelect = 'none'
                  }}
                />
              )}
            </th>
          )
        })}
      </tr>
    </thead>
  )
}
