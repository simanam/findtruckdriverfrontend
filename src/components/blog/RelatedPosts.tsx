import { PostCard } from './PostCard'

interface RelatedPostsProps {
  posts: any[]
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts?.length) return null

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-white mb-6">Related Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </section>
  )
}
