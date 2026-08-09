import type { ReactNode } from 'react'

/**
 * Обёртка списочной таблицы — `<section class="panel"><table class="tbl">`
 * с padding:0/overflow-x:auto поверх `.panel`. Пишется вручную в 20 файлах
 * office сейчас; здесь — один раз.
 */
export function TableShell({ children, click }: { children: ReactNode; click?: boolean }) {
  return (
    <section className="panel panel--table">
      <table className={click ? 'tbl tbl--click' : 'tbl'}>{children}</table>
    </section>
  )
}
