import type { ReactNode } from 'react'

/**
 * Строка «пусто» в теле таблицы — inline-стиль copy-paste в 16-17 файлах
 * office сейчас, буквально один и тот же JSX каждый раз.
 */
export function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="caption" style={{ padding: 40, textAlign: 'center' }}>
        {children}
      </td>
    </tr>
  )
}
