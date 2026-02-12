import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { sanityFetch } from '@/sanity/lib/fetch'
import { postBySlugQuery, postSlugsQuery } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/image'
import { PortableText } from '@portabletext/react'
import { portableTextComponents } from '@/components/blog/PortableTextComponents'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { AuthorCard } from '@/components/blog/AuthorCard'
import { RelatedPosts } from '@/components/blog/RelatedPosts'
import { ShareButtons } from '@/components/blog/ShareButtons'
import { ReadingProgress } from '@/components/blog/ReadingProgress'
import { Breadcrumbs } from '@/components/blog/Breadcrumbs'
import { Footer } from '@/components/layout/Footer'
import { Calendar, Clock, Tag } from 'lucide-react'
import Link from 'next/link'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await sanityFetch<string[]>({
    query: postSlugsQuery,
    tags: ['post'],
  })
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await sanityFetch<any>({
    query: postBySlugQuery,
    params: { slug },
    tags: ['post'],
  })

  if (!post) return { title: 'Post Not Found' }

  const title = post.seoTitle || post.title
  const description = post.seoDescription || post.excerpt || ''
  const imageUrl = post.mainImage
    ? urlFor(post.mainImage).width(1200).height(630).url()
    : undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: post.author?.name ? [post.author.name] : undefined,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
    alternates: {
      canonical: `https://findtruckdriver.com/blog/${slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await sanityFetch<any>({
    query: postBySlugQuery,
    params: { slug },
    tags: ['post'],
  })

  if (!post) notFound()

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  const postUrl = `https://findtruckdriver.com/blog/${post.slug.current}`

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || '',
    image: post.mainImage
      ? urlFor(post.mainImage).width(1200).height(630).url()
      : undefined,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: post.author
      ? {
          '@type': 'Person',
          name: post.author.name,
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'FindTruckDriver',
      url: 'https://findtruckdriver.com',
    },
    mainEntityOfPage: postUrl,
    wordCount: post.readingTime ? post.readingTime * 200 : undefined,
  }

  return (
    <>
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="min-h-screen pt-20 pb-0">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <Breadcrumbs
              items={[
                ...(post.categories?.[0]
                  ? [
                      {
                        label: post.categories[0].title,
                        href: `/category/${post.categories[0].slug.current}`,
                      },
                    ]
                  : []),
                { label: post.title },
              ]}
            />
          </div>

          {/* Article Header */}
          <header className="mb-8">
            {/* Categories */}
            {post.categories?.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                {post.categories.map((cat: any) => (
                  <Link
                    key={cat._id}
                    href={`/category/${cat.slug.current}`}
                    className="bg-sky-500/20 text-sky-400 text-xs font-bold px-3 py-1 rounded-full border border-sky-500/30 hover:bg-sky-500/30 transition-colors"
                  >
                    {cat.title}
                  </Link>
                ))}
              </div>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-5">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-lg text-slate-400 mb-6">{post.excerpt}</p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6">
              {post.author && (
                <div className="flex items-center gap-2">
                  {post.author.image && (
                    <Image
                      src={urlFor(post.author.image).width(40).height(40).url()}
                      alt={post.author.name}
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                  )}
                  <span className="text-slate-300 font-medium">
                    {post.author.name}
                  </span>
                </div>
              )}
              {formattedDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={post.publishedAt}>{formattedDate}</time>
                </span>
              )}
              {post.readingTime && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {post.readingTime} min read
                </span>
              )}
            </div>

            {/* Share */}
            <ShareButtons url={postUrl} title={post.title} />
          </header>

          {/* Main Image */}
          {post.mainImage && (
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-10">
              <Image
                src={urlFor(post.mainImage).width(1200).height(675).url()}
                alt={post.mainImage.alt || post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
                priority
              />
            </div>
          )}

          {/* Article Body — centered, readable width */}
          <div className="max-w-2xl mx-auto">
            {post.body && (
              <PortableText
                value={post.body}
                components={portableTextComponents}
              />
            )}

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mt-10 pt-6 border-t border-slate-800">
                <Tag className="w-4 h-4 text-slate-500" />
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="bg-slate-800 text-slate-400 text-xs px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Share (bottom) */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <ShareButtons url={postUrl} title={post.title} />
            </div>
          </div>

          {/* Table of Contents (desktop — fixed sidebar) */}
          <aside className="hidden xl:block fixed top-24 left-8 w-52">
            <TableOfContents body={post.body || []} />
          </aside>

          {/* Author Card */}
          {post.author && (
            <div className="mt-12">
              <AuthorCard author={post.author} />
            </div>
          )}

          {/* Related Posts */}
          <RelatedPosts posts={post.relatedPosts || []} />
        </div>

        <div className="mt-16">
          <Footer />
        </div>
      </article>
    </>
  )
}
