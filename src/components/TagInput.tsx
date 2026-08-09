'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'

/**
 * Ввод тегов чипами с подсказками из уже заведённых.
 *
 * Строкой через запятую это работает ровно до второго значения:
 * «шпатлёвка» и «шпатлевка» дают два разных тега на выходе. Поэтому
 * существующие теги предлагаются первыми, а совпадение по началу слова
 * подставляется Tab или Enter.
 *
 * Наружу значение уходит скрытым полем `name` — форма отправляется как
 * обычная, без JS-обвязки на сохранении.
 *
 * Источник подсказок — снаружи через `fetchSuggestions`, не зашит внутрь
 * (было: захардкоженный `/api/v1/goods/tags` в office — не переносится
 * между приложениями/сущностями as is). Без пропа подсказок просто не
 * будет — ввод тегов по Enter/Tab/запятой работает и без них.
 */

export interface TagSuggestion {
  tag: string
  count: number
}

export function TagInput({
  name = 'tags',
  initial = [],
  placeholder = 'тег, ещё тег…',
  fetchSuggestions,
}: {
  name?: string
  initial?: string[]
  placeholder?: string
  fetchSuggestions?: (query: string, signal: AbortSignal) => Promise<TagSuggestion[]>
}) {
  const [tags, setTags] = useState<string[]>(initial)
  const [draft, setDraft] = useState('')
  const [hints, setHints] = useState<TagSuggestion[]>([])
  const [openHints, setOpenHints] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  const add = (raw: string) => {
    const tag = raw.trim().replace(/\s+/g, ' ')
    if (!tag) return
    // Повтор в другом регистре — тот же тег, поэтому сравниваем нечувствительно.
    if (tags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setDraft('')
      return
    }
    setTags([...tags, tag].slice(0, 30))
    setDraft('')
    setOpenHints(false)
  }

  const remove = (tag: string) => setTags(tags.filter((t) => t !== tag))

  useEffect(() => {
    if (!fetchSuggestions) return
    const term = draft.trim()
    if (term.length < 1) {
      setHints([])
      return
    }
    const ctl = new AbortController()
    const timer = setTimeout(() => {
      fetchSuggestions(term, ctl.signal)
        .then((list) => {
          setHints(list.filter((h) => !tags.some((t) => t.toLowerCase() === h.tag.toLowerCase())))
          setOpenHints(true)
        })
        .catch(() => undefined)
    }, 160)
    return () => {
      clearTimeout(timer)
      ctl.abort()
    }
  }, [draft, tags, fetchSuggestions])

  // Клик мимо закрывает подсказки: иначе они висят поверх соседних полей.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpenHints(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      if (!draft.trim()) return
      e.preventDefault()
      // Tab и Enter при открытой подсказке берут её, а не набранное:
      // так теги сходятся к общему написанию.
      add(openHints && hints[0] ? hints[0].tag : draft)
    } else if (e.key === 'Backspace' && !draft && tags.length > 0) {
      remove(tags[tags.length - 1]!)
    } else if (e.key === 'Escape') {
      setOpenHints(false)
    }
  }

  return (
    <div className="tagbox" ref={box}>
      <input type="hidden" name={name} value={tags.join(', ')} />
      {tags.map((tag) => (
        <span className="fchip on" key={tag}>
          {tag}
          <button className="ibtn" type="button" onClick={() => remove(tag)} title="Убрать">
            <svg>
              <use href="#i-x" />
            </svg>
          </button>
        </span>
      ))}
      <span className="tagbox__in">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={tags.length === 0 ? placeholder : 'ещё тег…'}
        />
        {openHints && hints.length > 0 && (
          <span className="taghints">
            {hints.map((h) => (
              <button className="qrow" type="button" key={h.tag} onClick={() => add(h.tag)}>
                <span className="qrow__t">
                  <b>{h.tag}</b>
                </span>
                <span className="caption">{h.count}</span>
              </button>
            ))}
          </span>
        )}
      </span>
    </div>
  )
}
