import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/sanity/image'
import { Clock, Calendar } from 'lucide-react'

interface PostCardProps {
  post: {
    title: string
    slug: { current: string }
    excerpt?: string
    mainImage?: any
    publishedAt?: string
    readingTime?: number
    categories?: { _id: string; title: string; slug: { current: string } }[]
    author?: { name: string; slug: { current: string }; image?: any }
  }
}

export function PostCard({ post }: PostCardProps) {
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <article className="group bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/5">
      <Link href={`/blog/${post.slug.current}`}>
        {/* Image */}
        <div className="relative aspect-[16/9] overflow-hidden">
          {post.mainImage ? (
            <Image
              src={urlFor(post.mainImage).width(640).height(360).url()}
              alt={post.mainImage.alt || post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
              <span className="text-slate-600 text-sm">No image</span>
            </div>
          )}
          {/* Category Badge */}
          {post.categories?.[0] && (
            <span className="absolute top-3 left-3 bg-sky-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
              {post.categories[0].title}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h2 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors line-clamp-2 mb-2">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-slate-400 text-sm line-clamp-2 mb-4">
              {post.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-slate-500">
            {formattedDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
            )}
            {post.readingTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTime} min read
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}
