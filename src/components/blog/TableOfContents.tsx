'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { List } from 'lucide-react'

interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  body: any[]
}

export function TableOfContents({ body }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')
  const headings = extractHeadings(body)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-80px 0px -80% 0px' }
    )

    headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 2) return null

  return (
    <nav className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <List className="w-4 h-4" />
        Table of Contents
      </h3>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                'block text-sm transition-colors hover:text-sky-400',
                heading.level === 3 ? 'pl-4' : '',
                activeId === heading.id
                  ? 'text-sky-400 font-medium'
                  : 'text-slate-500'
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function extractHeadings(body: any[]): TocItem[] {
  if (!body) return []
  return body
    .filter(
      (block) =>
        block._type === 'block' &&
        (block.style === 'h2' || block.style === 'h3')
    )
    .map((block) => {
      const text = block.children
        .map((child: any) => child.text)
        .join('')
      return {
        id: text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
        text,
        level: block.style === 'h2' ? 2 : 3,
      }
    })
}
