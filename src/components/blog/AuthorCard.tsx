import Image from 'next/image'
import { urlFor } from '@/sanity/image'

interface AuthorCardProps {
  author: {
    name: string
    image?: any
    bio?: string
    role?: string
  }
}

export function AuthorCard({ author }: AuthorCardProps) {
  return (
    <div className="flex items-start gap-4 bg-slate-900/60 border border-slate-800 rounded-xl p-5">
      {author.image && (
        <Image
          src={urlFor(author.image).width(80).height(80).url()}
          alt={author.name}
          width={56}
          height={56}
          className="rounded-full shrink-0"
        />
      )}
      <div>
        <p className="font-bold text-white">{author.name}</p>
        {author.role && (
          <p className="text-xs text-sky-400 font-medium mb-2">{author.role}</p>
        )}
        {author.bio && (
          <p className="text-sm text-slate-400 leading-relaxed">{author.bio}</p>
        )}
      </div>
    </div>
  )
}
