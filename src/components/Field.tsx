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
  extra,
  children,
}: {
  label: string
  wide?: boolean
  /** Например, кнопка-иконка AI-заполнения рядом с подписью. */
  extra?: ReactNode
  children: ReactNode
}) {
  return (
    <label className={wide ? 'field field--wide' : 'field'}>
      <span>
        {label}
        {extra}
      </span>
      {children}
    </label>
  )
}
