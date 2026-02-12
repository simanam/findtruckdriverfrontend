import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { message: 'Valid email required' },
        { status: 400 }
      )
    }

    // Send confirmation email via Resend
    const resendKey = process.env.RESEND_KEY
    if (resendKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'FindTruckDriver <noreply@findtruckdriver.com>',
          to: email,
          subject: 'Welcome to FindTruckDriver Newsletter',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #0ea5e9;">Welcome to FindTruckDriver!</h1>
              <p>Thanks for subscribing to our newsletter. You'll receive:</p>
              <ul>
                <li>Weekly trucking industry news & updates</li>
                <li>Driver lifestyle tips & product reviews</li>
                <li>Regulation changes & compliance updates</li>
              </ul>
              <p>Keep on truckin'!</p>
              <p style="color: #94a3b8; font-size: 12px;">
                FindTruckDriver by Logixtecs Solutions LLC
              </p>
            </div>
          `,
        }),
      })
    }

    // Store in Notion database if configured
    const notionKey = process.env.NOTION_INTEGRATION_KEY
    const notionDbId = process.env.NOTION_DATABASE_ID
    if (notionKey && notionDbId) {
      await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${notionKey}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          parent: { database_id: notionDbId },
          properties: {
            Name: { title: [{ text: { content: email } }] },
            Email: { email },
            Category: {
              select: { name: 'Newsletter Subscription' },
            },
            Status: {
              select: { name: 'New' },
            },
            Source: {
              select: { name: 'Blog Newsletter' },
            },
          },
        }),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Newsletter signup error:', error)
    return NextResponse.json(
      { message: 'Failed to process subscription' },
      { status: 500 }
    )
  }
}
