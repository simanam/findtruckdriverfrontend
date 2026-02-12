import { Metadata } from 'next'
import { sanityFetch } from '@/sanity/lib/fetch'
import { searchPostsQuery } from '@/sanity/lib/queries'
import { PostGrid } from '@/components/blog/PostGrid'
import { SearchBar } from '@/components/blog/SearchBar'
import { Breadcrumbs } from '@/components/blog/Breadcrumbs'
import { Footer } from '@/components/layout/Footer'
import { Search } from 'lucide-react'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `Search: "${q}" — FindTruckDriver` : 'Search — FindTruckDriver',
    robots: { index: false },
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const searchTerm = q?.trim() || ''

  const posts = searchTerm
    ? await sanityFetch<any[]>({
        query: searchPostsQuery,
        params: { searchQuery: searchTerm },
        tags: ['post'],
      })
    : []

  return (
    <main className="min-h-screen pt-20 pb-0">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: 'Search' }]} />
        </div>

        <header className="mb-8">
          <h1 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
            <Search className="w-8 h-8 text-sky-400" />
            Search Articles
          </h1>
          <SearchBar defaultValue={searchTerm} className="max-w-lg" />
        </header>

        {searchTerm && (
          <p className="text-slate-500 text-sm mb-6">
            {posts.length} result{posts.length !== 1 ? 's' : ''} for &quot;{searchTerm}&quot;
          </p>
        )}

        {!searchTerm && (
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg">
              Enter a search term to find articles.
            </p>
          </div>
        )}

        {searchTerm && <PostGrid posts={posts} />}
      </div>

      <div className="mt-16">
        <Footer />
      </div>
    </main>
  )
}
