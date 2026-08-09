'use client'

import type { ReactNode } from 'react'

/**
 * Панель массовых действий — общая для всех таблиц с чекбоксами. Сама не
 * хранит выбор — просто рендерит количество и переданные кнопки действий,
 * когда count > 0; учёт выбранных строк — в конкретной таблице.
 */
export function BulkBar({
  count,
  onClear,
  children,
}: {
  count: number
  onClear: () => void
  children: ReactNode
}) {
  if (count === 0) return null

  return (
    <div className="bulkbar">
      <span className="bulkbar__count">Выбрано: {count}</span>
      <div className="bulkbar__actions">{children}</div>
      <button type="button" className="bulkbar__clear" onClick={onClear}>
        Снять выделение
      </button>
    </div>
  )
}
