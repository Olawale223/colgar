import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { isRecord, readJson, RequestInputError, escapeHtml, consumeRequestLimit } from "@/lib/server/http";
import { getStaffSession } from "@/lib/server/staff-session";
import { getRuntimeEnv, mongoCommand } from "@/lib/server/mongo-store";

export async function POST(request: NextRequest) {
  const session = await getStaffSession(["admin"]);
  if (!session.user) {
    return NextResponse.json({ error: session.error }, { status: session.status });
  }
  const env = await getRuntimeEnv() as Record<string, string | undefined>;
  const resendKey = env.RESEND_API_KEY;
  const from = env.NEWSLETTER_FROM;
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  if (!resendKey || !from || !siteUrl) {
    return NextResponse.json({ error: "Newsletter sending is not configured." }, { status: 503 });
  }

  try {
    if (!await consumeRequestLimit(request, "newsletter-send", 5, 3600)) {
      return NextResponse.json({ error: "Newsletter send limit reached. Try again later." }, { status: 429 });
    }

    const body = await readJson(request, 4_000);
    if (!isRecord(body) || typeof body.postId !== "string") {
      throw new RequestInputError("Choose a published story to send.");
    }

    const [post, subscribers] = await Promise.all([
      mongoCommand<{
        id: string; href: string; title: string; description: string; content: string;
        status: string; include_in_newsletter: boolean;
      } | null>({
        action: "findOne", collection: "blog_posts", filter: { id: body.postId },
        projection: { id: 1, href: 1, title: 1, description: 1, content: 1, status: 1, include_in_newsletter: 1 }
      }),
      mongoCommand<Array<{ id: string; email: string; unsubscribe_token: string }>>({
        action: "find", collection: "subscribers", filter: { status: "active" },
        sort: { created_at: 1 }, projection: { id: 1, email: 1, unsubscribe_token: 1 }
      })
    ]);
    if (!post || post.status !== "published" || !post.include_in_newsletter) {
      return NextResponse.json({ error: "Only published, newsletter-enabled stories can be sent." }, { status: 400 });
    }
    if (!subscribers?.length) {
      return NextResponse.json({ error: "There are no confirmed subscribers to email." }, { status: 409 });
    }
    if (subscribers.length > 500) {
      return NextResponse.json({ error: "The list exceeds this direct-send limit. Configure a queued email provider before sending." }, { status: 413 });
    }

    const storyUrl = new URL(post.href, siteUrl).toString();
    const excerpt = escapeHtml(post.description).replace(/\r?\n/g, "<br>");
    const content = escapeHtml(post.content).replace(/\r?\n/g, "<br>");
    let sent = 0;
    let failed = 0;
    for (const subscriber of subscribers) {
      const unsubscribeUrl = new URL("/unsubscribe", siteUrl);
      unsubscribeUrl.searchParams.set("token", subscriber.unsubscribe_token);
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [subscriber.email],
          subject: `Colgar story: ${post.title}`,
          html: `<h1>${escapeHtml(post.title)}</h1><p>${excerpt}</p><p>${content}</p><p><a href="${escapeHtml(storyUrl)}">Read the story</a></p><hr><p><a href="${escapeHtml(unsubscribeUrl.toString())}">Unsubscribe from Colgar updates</a></p>`
        }),
        cache: "no-store"
      });

      const providerResponse = await emailResponse.json().catch(() => ({})) as { id?: string; message?: string };
      const status = emailResponse.ok ? "sent" : "failed";
      if (emailResponse.ok) sent += 1;
      else {
        failed += 1;
        console.error("Resend rejected a Colgar newsletter message.", emailResponse.status, providerResponse.message);
      }

      await mongoCommand({
        action: "insertOne",
        collection: "newsletter_deliveries",
        document: {
          id: randomUUID(),
          post_id: post.id,
          subscriber_id: subscriber.id,
          provider_id: providerResponse.id ?? null,
          status,
          error: emailResponse.ok ? null : `Provider returned ${emailResponse.status}`,
          created_at: new Date().toISOString()
        }
      });
    }

    return NextResponse.json({
      message: failed ? `Sent ${sent}; ${failed} delivery${failed === 1 ? "" : "ies"} failed.` : `Sent to ${sent} subscriber${sent === 1 ? "" : "s"}.`,
      sent,
      failed
    });
  } catch (error) {
    if (error instanceof RequestInputError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Colgar newsletter send failed.", error);
    return NextResponse.json({ error: "The newsletter could not be sent." }, { status: 503 });
  }
}
