import type { ReactNode } from 'react'

/**
 * Поле формы: <label class="field"><span>Название</span><input/></label>.
 *
 * Разметка — office (span/label доступнее, чем div/label из shop), стили —
 * shop (см. styles/field.css). Раскладку/сетку задаёт .fgrid снаружи —
 * здесь только подпись и поле, без внешних отступов.
 */
export function Field({
  label,
  wide,
  children,
}: {
  label: string
  wide?: boolean
  children: ReactNode
}) {
  return (
    <label className={wide ? 'field field--wide' : 'field'}>
      <span>{label}</span>
      {children}
    </label>
  )
}
