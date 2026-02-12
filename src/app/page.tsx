import { Metadata } from 'next'
import { sanityFetch } from '@/sanity/lib/fetch'
import {
  postsQuery,
  postCountQuery,
  featuredPostQuery,
  categoriesQuery,
} from '@/sanity/lib/queries'
import { FeaturedPost } from '@/components/blog/FeaturedPost'
import { PostGrid } from '@/components/blog/PostGrid'
import { CategoryBar } from '@/components/blog/CategoryBar'
import { NewsletterForm } from '@/components/blog/NewsletterForm'
import { SearchBar } from '@/components/blog/SearchBar'
import { Pagination } from '@/components/blog/Pagination'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'
import { Map as MapIcon } from 'lucide-react'

const POSTS_PER_PAGE = 8

export const metadata: Metadata = {
  title: 'FindTruckDriver — Trucking News, Tips & Driver Lifestyle',
  description:
    'Your source for trucking industry news, driver lifestyle tips, product reviews, regulations, and real-time driver tools. By truckers, for truckers.',
  openGraph: {
    title: 'FindTruckDriver — Trucking News, Tips & Driver Lifestyle',
    description:
      'Your source for trucking industry news, driver lifestyle tips, product reviews, regulations, and real-time driver tools.',
    type: 'website',
  },
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const start = (page - 1) * POSTS_PER_PAGE
  const end = start + POSTS_PER_PAGE

  const [featured, posts, totalCount, categories] = await Promise.all([
    page === 1
      ? sanityFetch<any>({ query: featuredPostQuery, tags: ['post'] })
      : null,
    sanityFetch<any[]>({
      query: postsQuery,
      params: { start, end },
      tags: ['post'],
    }),
    sanityFetch<number>({ query: postCountQuery, tags: ['post'] }),
    sanityFetch<any[]>({ query: categoriesQuery, tags: ['category'] }),
  ])

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE)

  // Filter out the featured post from the grid (page 1 only)
  const gridPosts =
    page === 1 && featured
      ? posts.filter((p: any) => p._id !== featured._id)
      : posts

  return (
    <main className="min-h-screen pt-20 pb-0">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar className="max-w-md" />
        </div>

        {/* Featured Post (page 1 only) */}
        {page === 1 && featured && (
          <section className="mb-10">
            <FeaturedPost post={featured} />
          </section>
        )}

        {/* Category Filter */}
        <section className="mb-8">
          <CategoryBar categories={categories} />
        </section>

        {/* Main Content Area */}
        <div className="flex gap-8">
          {/* Posts Grid */}
          <div className="flex-1 min-w-0">
            <PostGrid posts={gridPosts} />
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              basePath="/"
            />
          </div>

          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-6">
            <NewsletterForm />

            {/* Driver Tools CTA */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-2">Driver Tools</h3>
              <p className="text-xs text-slate-500 mb-3">
                Check in with your status and see other drivers near you in real time.
              </p>
              <Link
                href="/map"
                className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
              >
                <MapIcon className="w-4 h-4" />
                Open Driver Map
              </Link>
            </div>

            {/* Categories */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-3">Categories</h3>
              <ul className="space-y-2">
                {categories.map((cat: any) => (
                  <li key={cat._id}>
                    <Link
                      href={`/category/${cat.slug.current}`}
                      className="text-sm text-slate-400 hover:text-sky-400 transition-colors"
                    >
                      {cat.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <div className="mt-16">
        <Footer />
      </div>
    </main>
  )
}
