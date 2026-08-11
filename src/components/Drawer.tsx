'use client'

import { useEffect, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react'

/**
 * Правый sidebar для добавления/редактирования — рендерится поверх
 * текущего списка, летает над контентом (fixed + подложка), список под
 * собой не сдвигает. Сама не хранит open/closed — тот, кто её монтирует
 * (в office это intercepting-роут app/(dashboard)/@drawer), и решает,
 * когда она есть в дереве.
 *
 * Закрытие — везде через onRequestClose, не собственный router.back():
 * office оборачивает и передаёт `() => router.back()`, pos/другое
 * приложение — что у него на этот случай есть. Структура/поведение
 * (выезд справа, resize за левый край, ширина в localStorage) не
 * меняются при переносе — это паттерн, не скин.
 *
 * Ширина растягивается за левый край, как ресайз окна — запоминается в
 * localStorage под `widthKey`, общая для всех разделов одного
 * приложения (это предпочтение по экрану/руке, не по конкретной форме).
 */

const MIN_WIDTH = 380
const MAX_WIDTH = 900
const MOBILE_BREAKPOINT = 480

function clampWidth(w: number): number {
  const max = Math.min(MAX_WIDTH, window.innerWidth * 0.95)
  return Math.min(Math.max(w, MIN_WIDTH), max)
}

/**
 * Раздел в узкой иконочной панели по правому краю drawer'а — как
 * Details/Comments/Activity в детальной панели задачи K. icon — обычный
 * ReactNode (например, `<svg><use href="#i-x"/></svg>`), не строка-id:
 * у каждого приложения свой спрайт (office/shop/pos), Drawer в @prf/ui
 * не должен знать, какие иконки в нём есть.
 */
export interface DrawerSection {
  id: string
  icon: ReactNode
  label: string
  /** Число на бейдже поверх иконки — например, количество непрочитанных. */
  badgeCount?: number
  content: ReactNode
}

export function Drawer({
  title,
  subtitle,
  onRequestClose,
  closeOnEsc = true,
  closeOnVeilClick = true,
  widthKey = 'prf_drawer_width',
  sections,
  defaultSection,
  footer,
  children,
}: {
  title: ReactNode
  /** Короткая строка под заголовком — например, внутренний артикул товара. */
  subtitle?: ReactNode
  onRequestClose: () => void
  closeOnEsc?: boolean
  closeOnVeilClick?: boolean
  /** Свой ключ, если приложению нужна отдельная от остальных память ширины. */
  widthKey?: string
  /**
   * Разделы под иконочной панелью справа — контент переключается кликом,
   * без похода на сервер. Если не заданы, drawer работает как раньше:
   * children — единственное и единое тело панели.
   */
  sections?: DrawerSection[]
  /** Какой раздел открыт первым — по умолчанию первый в списке. */
  defaultSection?: string
  /**
   * Кнопки действий — прибиты к низу панели, не уезжают со скроллом и не
   * зависят от того, какой раздел сейчас открыт (кнопка «Сохранить»
   * сохраняет всю форму целиком, а не только видимый раздел). Класть
   * сюда `<div className="toolbar">…</div>` с кнопками — сам footer
   * задаёт только отступы и границу, ряд кнопок — не его забота.
   */
  footer?: ReactNode
  /** Постоянная часть тела — над разделами, видна независимо от выбранного раздела. */
  children?: ReactNode
}) {
  const [width, setWidth] = useState<number | null>(null)
  const [activeSection, setActiveSection] = useState(defaultSection ?? sections?.[0]?.id)
  const dragging = useRef(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(widthKey)
      if (raw) setWidth(clampWidth(Number(raw)))
    } catch {
      // приватный режим — просто останемся на дефолтной ширине из CSS
    }
  }, [widthKey])

  useEffect(() => {
    if (!closeOnEsc) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onRequestClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeOnEsc, onRequestClose])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      // Панель растёт от правого края экрана — новая ширина это
      // расстояние от курсора до правого края, а не до левого.
      setWidth(clampWidth(window.innerWidth - e.clientX))
    }
    const onUp = () => {
      if (!dragging.current) return
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      setWidth((w) => {
        if (w != null) {
          try {
            localStorage.setItem(widthKey, String(w))
          } catch {
            // приватный режим — не запомнится, не страшно
          }
        }
        return w
      })
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [widthKey])

  const startDrag = (e: ReactMouseEvent) => {
    if (window.innerWidth <= MOBILE_BREAKPOINT) return
    e.preventDefault()
    dragging.current = true
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'
  }

  return (
    <div className="drawer__veil" onMouseDown={closeOnVeilClick ? onRequestClose : undefined}>
      <div
        className="drawer"
        style={width != null ? { width } : undefined}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          className="drawer__resize"
          onMouseDown={startDrag}
          title="Потянуть, чтобы изменить ширину"
        />
        <div className="drawer__head">
          <div className="drawer__head-titles">
            <h2>{title}</h2>
            {subtitle && <span className="drawer__head-sub">{subtitle}</span>}
          </div>
          <button type="button" className="drawer__close" onClick={onRequestClose} title="Закрыть">
            <svg>
              <use href="#i-x" />
            </svg>
          </button>
        </div>
        <div className={sections ? 'drawer__body drawer__body--fixed' : 'drawer__body'}>
          {children}
        </div>
        {sections && sections.length > 0 && (
          <div className="drawer__sections">
            <div className="drawer__sections-content">
              {sections.find((s) => s.id === activeSection)?.content}
            </div>
            <nav className="drawer__sections-nav" aria-label="Разделы">
              {sections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`drawer__section-tab${s.id === activeSection ? ' on' : ''}`}
                  onClick={() => setActiveSection(s.id)}
                  title={s.label}
                >
                  {s.icon}
                  {Boolean(s.badgeCount) && (
                    <span className="drawer__section-badge">{s.badgeCount}</span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        )}
        {footer && <div className="drawer__footer">{footer}</div>}
      </div>
    </div>
  )
}
