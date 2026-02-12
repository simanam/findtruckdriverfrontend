import Link from 'next/link'
import { cn } from '@/lib/utils'

interface CategoryBarProps {
  categories: { _id: string; title: string; slug: { current: string } }[]
  activeSlug?: string
}

export function CategoryBar({ categories, activeSlug }: CategoryBarProps) {
  return (
    <nav className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
      <Link
        href="/"
        className={cn(
          'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all',
          !activeSlug
            ? 'bg-sky-500 text-white'
            : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
        )}
      >
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category._id}
          href={`/category/${category.slug.current}`}
          className={cn(
            'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap',
            activeSlug === category.slug.current
              ? 'bg-sky-500 text-white'
              : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
          )}
        >
          {category.title}
        </Link>
      ))}
    </nav>
  )
}
