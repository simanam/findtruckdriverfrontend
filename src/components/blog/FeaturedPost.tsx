import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/sanity/image'
import { Clock, Calendar, ArrowRight } from 'lucide-react'

interface FeaturedPostProps {
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

export function FeaturedPost({ post }: FeaturedPostProps) {
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <article className="group relative bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden hover:border-sky-500/30 transition-all duration-300">
      <Link href={`/blog/${post.slug.current}`} className="block md:flex">
        {/* Image */}
        <div className="relative md:w-3/5 aspect-[16/9] md:aspect-auto md:min-h-[320px] overflow-hidden">
          {post.mainImage ? (
            <Image
              src={urlFor(post.mainImage).width(900).height(500).url()}
              alt={post.mainImage.alt || post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 60vw"
              priority
            />
          ) : (
            <div className="w-full h-full bg-slate-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent md:bg-gradient-to-r md:from-transparent md:to-slate-950/40" />
        </div>

        {/* Content */}
        <div className="relative md:w-2/5 p-6 md:p-8 flex flex-col justify-center">
          {post.categories?.[0] && (
            <span className="inline-block w-fit bg-sky-500/20 text-sky-400 text-xs font-bold px-3 py-1 rounded-full mb-4 border border-sky-500/30">
              {post.categories[0].title}
            </span>
          )}

          <h2 className="text-2xl md:text-3xl font-black text-white group-hover:text-sky-400 transition-colors mb-3 leading-tight">
            {post.title}
          </h2>

          {post.excerpt && (
            <p className="text-slate-400 text-sm md:text-base mb-5 line-clamp-3">
              {post.excerpt}
            </p>
          )}

          {/* Author & Meta */}
          <div className="flex items-center gap-4 text-sm text-slate-500 mb-5">
            {post.author && (
              <div className="flex items-center gap-2">
                {post.author.image && (
                  <Image
                    src={urlFor(post.author.image).width(32).height(32).url()}
                    alt={post.author.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                )}
                <span className="text-slate-300">{post.author.name}</span>
              </div>
            )}
            {formattedDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
            )}
            {post.readingTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTime} min
              </span>
            )}
          </div>

          <span className="inline-flex items-center gap-2 text-sky-400 font-semibold text-sm group-hover:gap-3 transition-all">
            Read article <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </Link>
    </article>
  )
}
