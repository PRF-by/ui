import type { CSSProperties, ReactNode } from 'react'

export type BadgeTone = 'solid' | 'pastel'

export interface BadgeProps {
  /**
   * solid — прямоугольник 6px, uppercase, залитый цветом (shop:
   * мерч-лейблы на карточках товара — «Хит», «Новинка»).
   * pastel — пилюля с точкой, бледный фон + цветной текст (office:
   * статусы заказов/товаров).
   *
   * Разные формы для разной семантики: shop красит бейдж цветом отдела,
   * office — цветом статуса. Компонент не знает ни про то, ни про другое —
   * только про то, как покрасить то, что ему передали.
   */
  tone?: BadgeTone
  /** Цвет текста+точки (pastel) или фона (solid, по умолчанию). */
  color: string
  /** Фон — обязателен по смыслу для pastel (свой на каждый статус, не
   *  выводится автоматически из color). Для solid можно не передавать. */
  background?: string
  /** Текст поверх solid-фона, если не белый (например shop --best:
   *  жёлтый фон, чёрный текст). */
  textColor?: string
  dot?: boolean
  className?: string
  children: ReactNode
}

export function Badge({
  tone = 'solid',
  color,
  background,
  textColor,
  dot,
  className,
  children,
}: BadgeProps) {
  const style: CSSProperties & Record<string, string> = { '--badge-color': color }
  if (background) style['--badge-bg'] = background
  if (textColor) style['--badge-text'] = textColor

  const classes = ['badge', `badge--${tone}`]
  if (dot) classes.push('badge--dot')
  if (className) classes.push(className)

  return (
    <span className={classes.join(' ')} style={style}>
      {children}
    </span>
  )
}
