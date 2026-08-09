/**
 * Иконки, нужные самим компонентам пакета (сейчас — только шеврон Panel).
 * Монтируется один раз в layout приложения-потребителя, рядом с его
 * собственным спрайтом. Без этого `<use href="#i-chevron-down"/>` внутри
 * Panel молча не отрисуется в приложении, у которого нет такого символа
 * в своём спрайте — иконка просто не появится, без ошибки в консоли.
 */
export function UiSprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <symbol
          id="i-chevron-down"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </symbol>
      </defs>
    </svg>
  )
}
