import Image from 'next/image'
import { urlFor } from '@/sanity/image'
import type { PortableTextComponents } from '@portabletext/react'
import { Info, AlertTriangle, Lightbulb } from 'lucide-react'

export const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset?._ref) return null
      return (
        <figure className="my-8">
          <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden">
            <Image
              src={urlFor(value).width(1200).height(675).url()}
              alt={value.alt || ''}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 720px"
            />
          </div>
          {value.caption && (
            <figcaption className="text-center text-sm text-slate-500 mt-3">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
    youtube: ({ value }) => {
      if (!value?.url) return null
      const videoId = extractYouTubeId(value.url)
      if (!videoId) return null
      return (
        <div className="my-8 aspect-video rounded-xl overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )
    },
    callout: ({ value }) => {
      const icons = {
        info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
        tip: <Lightbulb className="w-5 h-5 text-emerald-400 shrink-0" />,
      }
      const colors = {
        info: 'border-sky-500/30 bg-sky-500/5',
        warning: 'border-amber-500/30 bg-amber-500/5',
        tip: 'border-emerald-500/30 bg-emerald-500/5',
      }
      const type = (value.type || 'info') as keyof typeof icons
      return (
        <div className={`my-6 p-4 rounded-xl border ${colors[type]} flex gap-3`}>
          {icons[type]}
          <p className="text-slate-300 text-sm leading-relaxed">{value.text}</p>
        </div>
      )
    },
  },
  block: {
    h2: ({ children }) => (
      <h2 id={slugify(children)} className="text-2xl font-bold text-white mt-10 mb-4 scroll-mt-24">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 id={slugify(children)} className="text-xl font-bold text-white mt-8 mb-3 scroll-mt-24">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg font-bold text-white mt-6 mb-2">{children}</h4>
    ),
    normal: ({ children }) => (
      <p className="text-slate-300 leading-relaxed mb-4">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 pl-4 border-l-4 border-sky-500/50 text-slate-400 italic">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const target = value?.blank ? '_blank' : undefined
      return (
        <a
          href={value?.href}
          target={target}
          rel={target === '_blank' ? 'noopener noreferrer' : undefined}
          className="text-sky-400 underline underline-offset-2 hover:text-sky-300 transition-colors"
        >
          {children}
        </a>
      )
    },
    code: ({ children }) => (
      <code className="bg-slate-800 text-sky-300 px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 text-slate-300 mb-4 ml-2">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 text-slate-300 mb-4 ml-2">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="text-slate-300">{children}</li>,
    number: ({ children }) => <li className="text-slate-300">{children}</li>,
  },
}

function slugify(children: any): string {
  const text = Array.isArray(children)
    ? children
        .map((child) => (typeof child === 'string' ? child : ''))
        .join('')
    : String(children || '')
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function extractYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}
