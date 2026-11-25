"use client";

import { AppLink } from "@/components/AppLink";
import { useAdminContent } from "@/components/AdminContentProvider";
import { Photo } from "@/components/Photo";
import styles from "./page.module.css";

export function BlogPostDetail({ slug }: { slug: string }) {
  const { blogPosts, ready } = useAdminContent();
  const post = blogPosts.find((item) => item.id === slug && item.status === "published");

  if (!ready) {
    return <main id="main" className={styles.main}><p className="container">Loading story…</p></main>;
  }

  if (!post) {
    return (
      <main id="main" className={styles.main}>
        <section className={`container ${styles.unavailable}`}>
          <span className="eyebrow">Colgar journal</span>
          <h1>This story is not available.</h1>
          <AppLink className="text-link text-link-dark" href="/blog">Back to the blog <span aria-hidden="true">↗</span></AppLink>
        </section>
      </main>
    );
  }

  return (
    <main id="main" className={styles.main}>
      <div className={`container ${styles.breadcrumb}`}>
        <AppLink href="/">Home</AppLink><span aria-hidden="true">/</span>
        <AppLink href="/blog">Blog</AppLink><span aria-hidden="true">/</span>
        <span>{post.title}</span>
      </div>
      <article className={`container ${styles.article}`}>
        <div className={styles.image}>
          <Photo src={post.image} alt={post.alt} sizes="(max-width: 760px) 100vw, 1100px" priority />
        </div>
        <div className={styles.copy}>
          <span className="eyebrow">{post.meta}</span>
          <h1>{post.title}</h1>
          <p className={styles.summary}>{post.description}</p>
          <div className={styles.body}>{post.content}</div>
          <AppLink className="text-link text-link-dark" href="/blog">Back to all stories <span aria-hidden="true">↗</span></AppLink>
        </div>
      </article>
    </main>
  );
}
