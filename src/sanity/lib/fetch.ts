import { client } from '../client'
import type { QueryParams } from 'next-sanity'

export async function sanityFetch<T>({
  query,
  params = {},
  revalidate = 60,
}: {
  query: string
  params?: QueryParams
  tags?: string[]
  revalidate?: number
}): Promise<T> {
  return client.fetch<T>(query, params, {
    next: {
      revalidate,
    },
  })
}
