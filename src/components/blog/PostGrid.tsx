import { PostCard } from './PostCard'

interface PostGridProps {
  posts: any[]
}

export function PostGrid({ posts }: PostGridProps) {
  if (!posts.length) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 text-lg">No posts yet. Check back soon!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  )
}
