'use client'

import type { FormEvent, ReactNode } from 'react'

/**
 * Форма удаления с подтверждением — один компонент вместо копирования
 * onSubmit в каждое место (акции, достижения, статьи, уровни скидок,
 * массовое удаление товаров/расходов).
 */
export function ConfirmDeleteForm({
  action,
  confirmText,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>
  confirmText: string
  children: ReactNode
}) {
  return (
    <form
      action={action}
      onSubmit={(e: FormEvent<HTMLFormElement>) => {
        if (!confirm(confirmText)) e.preventDefault()
      }}
    >
      {children}
    </form>
  )
}
