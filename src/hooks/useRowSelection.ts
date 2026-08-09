'use client'

import { useState } from 'react'

/**
 * Set<string> + toggle/toggleAll — копипаст ровно в тех 4 таблицах
 * office, что уже используют BulkBar (goods, finance/expenses, staff,
 * orders). Сам не знает про BulkBar — просто состояние выбора строк.
 */
export function useRowSelection<T extends string = string>(ids: T[]) {
  const [selected, setSelected] = useState<Set<T>>(new Set())

  const toggle = (id: T) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelected((prev) => (prev.size === ids.length ? new Set() : new Set(ids)))
  }

  const clear = () => setSelected(new Set())

  const allSelected = ids.length > 0 && selected.size === ids.length

  return { selected, toggle, toggleAll, clear, allSelected }
}
