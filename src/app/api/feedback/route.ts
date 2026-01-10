import { NextRequest, NextResponse } from "next/server";

const NOTION_API_URL = "https://api.notion.com/v1/pages";
const NOTION_TOKEN = process.env.NEXT_PUBLIC_NOTION_INTEGRATION_KEY;
const DATABASE_ID = process.env.NEXT_PUBLIC_NOTION_DATABASE_ID;
const RESEND_API_KEY = process.env.NEXT_PUBLIC_RESEND_KEY;

async function sendConfirmationEmail(email: string, category: string) {
    if (!RESEND_API_KEY) {
        console.error("Resend API key not configured");
        return;
    }

    try {
        await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: "Findtruckdriver <noreply@logixtecs.com>",
                to: email,
                subject: "We received your feedback - Findtruckdriver",
                html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #1e293b; border-radius: 16px; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #334155;">
                            <img src="https://res.cloudinary.com/dcbttqrom/image/upload/v1768058007/FTD_LOGO_j0pnv5.png" alt="Findtruckdriver" width="48" height="48" style="display: block; margin: 0 auto 16px;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Thanks for your feedback!</h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 32px;">
                            <p style="margin: 0 0 16px; color: #e2e8f0; font-size: 16px; line-height: 1.6;">
                                We've received your <strong style="color: #38bdf8;">${category}</strong> and our team will review it shortly.
                            </p>
                            <p style="margin: 0 0 24px; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                                Your input helps us make Findtruckdriver better for everyone on the road. We truly appreciate you taking the time to share your thoughts with us.
                            </p>

                            <!-- Info Box -->
                            <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                                <p style="margin: 0; color: #94a3b8; font-size: 14px; line-height: 1.5;">
                                    <strong style="color: #e2e8f0;">What happens next?</strong><br>
                                    Our team reviews all feedback personally. If we need more details or have updates to share, we'll reach out to this email.
                                </p>
                            </div>

                            <!-- CTA -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="https://findtruckdriver.com" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0ea5e9, #2563eb); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 8px;">
                                            Back to Findtruckdriver
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 32px; background-color: #0f172a; text-align: center; border-top: 1px solid #334155;">
                            <p style="margin: 0 0 8px; color: #64748b; font-size: 12px;">
                                Truckers helping truckers.
                            </p>
                            <p style="margin: 0; color: #475569; font-size: 11px;">
                                Operated by <a href="https://www.logixtecs.com" style="color: #38bdf8; text-decoration: none;">Logixtecs Solutions LLC</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
                `,
            }),
        });
    } catch (error) {
        console.error("Failed to send confirmation email:", error);
        // Don't fail the whole request if email fails
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, category, message } = body;

        // Validate required fields
        if (!email || !category || !message) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        if (!NOTION_TOKEN || !DATABASE_ID) {
            console.error("Notion credentials not configured");
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        // Create Notion page
        const response = await fetch(NOTION_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${NOTION_TOKEN.replace(/"/g, '')}`,
                "Content-Type": "application/json",
                "Notion-Version": "2022-06-28",
            },
            body: JSON.stringify({
                parent: { database_id: DATABASE_ID },
                properties: {
                    // Title field (required for Notion)
                    "Name": {
                        title: [
                            {
                                text: {
                                    content: `${category}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`
                                }
                            }
                        ]
                    },
                    "Email": {
                        email: email
                    },
                    "Category": {
                        select: {
                            name: category
                        }
                    },
                    "Message": {
                        rich_text: [
                            {
                                text: {
                                    content: message
                                }
                            }
                        ]
                    },
                    "Status": {
                        select: {
                            name: "New"
                        }
                    },
                    "Source": {
                        select: {
                            name: "Website"
                        }
                    }
                }
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Notion API error:", errorData);
            return NextResponse.json(
                { error: "Failed to submit feedback" },
                { status: 500 }
            );
        }

        // Send confirmation email (don't await to speed up response)
        sendConfirmationEmail(email, category);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Feedback submission error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
