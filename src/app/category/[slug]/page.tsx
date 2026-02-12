import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { sanityFetch } from '@/sanity/lib/fetch'
import {
  categoryBySlugQuery,
  postsByCategoryQuery,
  postCountByCategoryQuery,
  categoriesQuery,
  categorySlugsQuery,
} from '@/sanity/lib/queries'
import { PostGrid } from '@/components/blog/PostGrid'
import { CategoryBar } from '@/components/blog/CategoryBar'
import { Pagination } from '@/components/blog/Pagination'
import { Breadcrumbs } from '@/components/blog/Breadcrumbs'
import { Footer } from '@/components/layout/Footer'

const POSTS_PER_PAGE = 8

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateStaticParams() {
  const slugs = await sanityFetch<string[]>({
    query: categorySlugsQuery,
    tags: ['category'],
  })
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await sanityFetch<any>({
    query: categoryBySlugQuery,
    params: { slug },
    tags: ['category'],
  })

  if (!category) return { title: 'Category Not Found' }

  return {
    title: `${category.title} — FindTruckDriver Blog`,
    description:
      category.description ||
      `Read the latest ${category.title.toLowerCase()} articles on FindTruckDriver.`,
    openGraph: {
      title: `${category.title} — FindTruckDriver Blog`,
      description:
        category.description ||
        `Read the latest ${category.title.toLowerCase()} articles.`,
    },
    alternates: {
      canonical: `https://findtruckdriver.com/category/${slug}`,
    },
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params
  const sp = await searchParams

  const category = await sanityFetch<any>({
    query: categoryBySlugQuery,
    params: { slug },
    tags: ['category'],
  })

  if (!category) notFound()

  const page = Number(sp.page) || 1
  const start = (page - 1) * POSTS_PER_PAGE
  const end = start + POSTS_PER_PAGE

  const [posts, totalCount, categories] = await Promise.all([
    sanityFetch<any[]>({
      query: postsByCategoryQuery,
      params: { categoryId: category._id, start, end },
      tags: ['post'],
    }),
    sanityFetch<number>({
      query: postCountByCategoryQuery,
      params: { categoryId: category._id },
      tags: ['post'],
    }),
    sanityFetch<any[]>({ query: categoriesQuery, tags: ['category'] }),
  ])

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE)

  return (
    <main className="min-h-screen pt-20 pb-0">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={[{ label: category.title }]} />
        </div>

        {/* Category Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
            {category.title}
          </h1>
          {category.description && (
            <p className="text-slate-400 text-lg max-w-2xl">
              {category.description}
            </p>
          )}
        </header>

        {/* Category Filter */}
        <section className="mb-8">
          <CategoryBar categories={categories} activeSlug={slug} />
        </section>

        {/* Posts */}
        <PostGrid posts={posts} />
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath={`/category/${slug}`}
        />
      </div>

      <div className="mt-16">
        <Footer />
      </div>
    </main>
  )
}
