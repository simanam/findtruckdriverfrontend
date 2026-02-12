import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify the webhook secret (configured in Sanity webhook settings)
    const secret = request.headers.get('sanity-webhook-signature') ||
                   request.headers.get('x-sanity-webhook-secret')
    if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
    }

    const { _type, slug } = body

    // Revalidate based on document type
    if (_type === 'post') {
      revalidatePath('/', 'page')
      if (slug?.current) {
        revalidatePath(`/blog/${slug.current}`, 'page')
      }
      revalidatePath('/feed.xml', 'page')
      revalidatePath('/sitemap.xml', 'page')
    } else if (_type === 'category') {
      revalidatePath('/', 'page')
      if (slug?.current) {
        revalidatePath(`/category/${slug.current}`, 'page')
      }
    } else if (_type === 'author') {
      revalidatePath('/', 'page')
    }

    return NextResponse.json({ revalidated: true, type: _type })
  } catch (error) {
    return NextResponse.json(
      { message: 'Error revalidating' },
      { status: 500 }
    )
  }
}
