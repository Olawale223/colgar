import { NextResponse } from "next/server";
import { mapBlogRow, mapProductRow, type BlogRow, type ProductRow } from "@/lib/server/content-mappers";
import { mongoCommand } from "@/lib/server/mongo-store";

export async function GET() {
  try {
    const [blogs, products] = await Promise.all([
      mongoCommand<BlogRow[]>({
        action: "find", collection: "blog_posts", filter: { status: "published" },
        sort: { updated_at: -1 }
      }),
      mongoCommand<ProductRow[]>({
        action: "find", collection: "products", filter: { visible: true },
        sort: { updated_at: -1 }
      })
    ]);

    return NextResponse.json({
      blogPosts: blogs.map(mapBlogRow),
      products: products.map(mapProductRow)
    }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" }
    });
  } catch (error) {
    console.error("Could not read Colgar's public content from MongoDB.", error);
    return NextResponse.json({ error: "Public content could not be loaded." }, { status: 503 });
  }
}
