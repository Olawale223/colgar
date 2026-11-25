import nextEnv from "@next/env";
import { MongoClient } from "mongodb";

nextEnv.loadEnvConfig(process.cwd());
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("Set MONGODB_URI before seeding.");

const [{ initialBlogPosts }, { products }] = await Promise.all([
  import("../data/blogPosts.ts"),
  import("../data/products.ts")
]);
const client = new MongoClient(uri);

const blogRows = initialBlogPosts.map((post) => ({
  id: post.id,
  href: post.href,
  image: post.image,
  alt: post.alt,
  meta: post.meta,
  title: post.title,
  description: post.description,
  content: post.content,
  status: post.status,
  include_in_newsletter: post.includeInNewsletter
}));
const productRows = products.map((product) => ({
  slug: product.slug,
  title: product.title,
  price: product.price,
  price_label: product.priceLabel,
  image: product.image,
  alt: product.alt,
  category: product.category,
  description: product.description,
  details: product.details,
  options: product.options ?? null,
  visible: true
}));

try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "colgar");
  await Promise.all([
    ...blogRows.map((document) => db.collection("blog_posts").updateOne(
      { id: document.id },
      { $setOnInsert: { ...document, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } },
      { upsert: true }
    )),
    ...productRows.map((document) => db.collection("products").updateOne(
      { slug: document.slug },
      { $setOnInsert: { ...document, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } },
      { upsert: true }
    ))
  ]);
  console.log(`Seeded ${blogRows.length} starter stories and ${productRows.length} shop items (existing records preserved).`);
} finally {
  await client.close();
}
