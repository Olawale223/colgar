import type { Metadata } from "next";
import { BlogPostDetail } from "./BlogPostDetail";
import { SiteFooter } from "@/components/SiteFooter";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export const metadata: Metadata = {
  title: "Colgar Journal — Colgar Foundation",
  description: "Stories and updates from the Colgar Foundation community."
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  return (
    <>
      <BlogPostDetail slug={slug} />
      <SiteFooter page="blog" />
    </>
  );
}
