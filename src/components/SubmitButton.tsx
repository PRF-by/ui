'use client'

import { useFormStatus } from 'react-dom'
import type { CSSProperties, ReactNode } from 'react'

/**
 * Кнопка отправки формы с индикатором ожидания. useFormStatus не требует
 * useActionState — работает и внутри «голых» <form action={fn.bind(null,
 * id)}>, поэтому один компонент закрывает и кнопки «Сохранить», и кнопки
 * «Удалить».
 *
 * Пропы намеренно совпадают с office/components/SubmitButton.tsx (было
 * до переноса в пакет) — это позволяет заменить исходный файл на реэкспорт
 * без правки 26 мест вызова: `className` остаётся сырой строкой классов
 * (`'btn btn--yellow'`), а не variant/size, как у нового `Button`.
 */
export function SubmitButton({
  children,
  pendingLabel,
  className = 'btn btn--yellow',
  icon,
  name,
  value,
  style,
  title,
}: {
  children: ReactNode
  pendingLabel: string
  className?: string
  /** Id символа спрайта потребителя, например "i-save". */
  icon?: string
  name?: string
  value?: string
  style?: CSSProperties
  title?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button
      className={className}
      type="submit"
      name={name}
      value={value}
      style={style}
      title={title}
      disabled={pending}
    >
      {pending ? (
        <span className="spinner" />
      ) : (
        icon && (
          <svg width="15" height="15">
            <use href={`#${icon}`} />
          </svg>
        )
      )}
      {pending ? pendingLabel : children}
    </button>
  )
}
