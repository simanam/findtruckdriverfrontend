import { groq } from 'next-sanity'

// ===== POST QUERIES =====

export const postsQuery = groq`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) [$start...$end] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    readingTime,
    featured,
    "categories": categories[]->{ _id, title, slug },
    "author": author->{ name, slug, image },
  }
`

export const postCountQuery = groq`
  count(*[_type == "post" && defined(slug.current)])
`

export const featuredPostQuery = groq`
  *[_type == "post" && featured == true && defined(slug.current)] | order(publishedAt desc) [0] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    readingTime,
    "categories": categories[]->{ _id, title, slug },
    "author": author->{ name, slug, image },
  }
`

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    body,
    publishedAt,
    readingTime,
    featured,
    seoTitle,
    seoDescription,
    tags,
    "categories": categories[]->{ _id, title, slug },
    "author": author->{ name, slug, image, bio, role },
    "relatedPosts": relatedPosts[]->{
      _id, title, slug, excerpt, mainImage, publishedAt, readingTime,
      "categories": categories[]->{ _id, title, slug }
    },
  }
`

export const postSlugsQuery = groq`
  *[_type == "post" && defined(slug.current)][].slug.current
`

// ===== CATEGORY QUERIES =====

export const categoriesQuery = groq`
  *[_type == "category"] | order(title asc) {
    _id,
    title,
    slug,
    description,
  }
`

export const categoryBySlugQuery = groq`
  *[_type == "category" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
  }
`

export const postsByCategoryQuery = groq`
  *[_type == "post" && defined(slug.current) && $categoryId in categories[]._ref] | order(publishedAt desc) [$start...$end] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    readingTime,
    "categories": categories[]->{ _id, title, slug },
    "author": author->{ name, slug, image },
  }
`

export const postCountByCategoryQuery = groq`
  count(*[_type == "post" && defined(slug.current) && $categoryId in categories[]._ref])
`

export const categorySlugsQuery = groq`
  *[_type == "category" && defined(slug.current)][].slug.current
`

// ===== AUTHOR QUERIES =====

export const authorBySlugQuery = groq`
  *[_type == "author" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    image,
    bio,
    role,
  }
`

// ===== SEARCH QUERIES =====

export const searchPostsQuery = groq`
  *[_type == "post" && defined(slug.current) && (
    title match $searchQuery + "*" ||
    excerpt match $searchQuery + "*" ||
    pt::text(body) match $searchQuery + "*"
  )] | order(publishedAt desc) [0...20] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    readingTime,
    "categories": categories[]->{ _id, title, slug },
    "author": author->{ name, slug, image },
  }
`

// ===== SITEMAP QUERIES =====

export const sitemapPostsQuery = groq`
  *[_type == "post" && defined(slug.current)] {
    "slug": slug.current,
    _updatedAt,
  }
`

export const sitemapCategoriesQuery = groq`
  *[_type == "category" && defined(slug.current)] {
    "slug": slug.current,
    _updatedAt,
  }
`

// ===== RSS FEED QUERY =====

export const rssFeedQuery = groq`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) [0...50] {
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    "authorName": author->name,
    "categories": categories[]->title,
  }
`
