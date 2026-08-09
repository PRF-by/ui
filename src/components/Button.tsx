import type { ComponentPropsWithoutRef } from 'react'

export type ButtonVariant = 'yellow' | 'black' | 'ghost' | 'danger'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export interface ButtonOwnProps {
  variant?: ButtonVariant
  /**
   * md — плотность shop (умолчание, для новых экранов). sm/xs — плотность
   * office (компактные админ-таблицы/тулбары). Это не выбор скина, а
   * выбор информационной плотности — остаётся за вызывающим кодом, не
   * решается один раз внутри компонента.
   */
  size?: ButtonSize
  block?: boolean
}

export type ButtonProps = ButtonOwnProps & ComponentPropsWithoutRef<'button'>

export function buttonClassName({
  variant = 'yellow',
  size = 'md',
  block,
  className,
}: ButtonOwnProps & { className?: string }): string {
  const classes = ['btn', `btn--${variant}`]
  if (size !== 'md') classes.push(`btn--${size}`)
  if (block) classes.push('btn--block')
  if (className) classes.push(className)
  return classes.join(' ')
}

export function Button({ variant, size, block, className, ...rest }: ButtonProps) {
  return <button className={buttonClassName({ variant, size, block, className })} {...rest} />
}
