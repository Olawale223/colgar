"use client";

import { useMemo, useState, type FormEvent } from "react";
import { AppLink } from "@/components/AppLink";
import {
  useAdminContent,
  type AuditEntry,
  type FinanceEntry,
  type ManagedProduct
} from "@/components/AdminContentProvider";
import { formatNaira, productCategories, type ProductCategory } from "@/data/products";
import type { BlogPost, BlogStatus } from "@/data/blogPosts";
import { isAllowedImageUrl, isSafeBlogHref } from "@/data/contentValidation";
import styles from "./AdminDashboard.module.css";

type SectionId = "overview" | "blogs" | "shop" | "newsletter" | "finance" | "audit";

const sections: { id: SectionId; label: string; mark: string }[] = [
  { id: "overview", label: "Overview", mark: "01" },
  { id: "blogs", label: "Blog posts", mark: "02" },
  { id: "shop", label: "Shop items", mark: "03" },
  { id: "newsletter", label: "Subscribers & email", mark: "04" },
  { id: "finance", label: "Finance ledger", mark: "05" },
  { id: "audit", label: "Audit history", mark: "06" }
];

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const {
    blogPosts,
    products,
    subscribers,
    financeEntries,
    auditLog,
    ready,
    role,
    backendConfigured,
    backendError,
    financeMfaRequired,
    signOut
  } = useAdminContent();
  const visibleSections = sections.filter((section) => (
    section.id === "overview"
    || (role === "admin" && ["blogs", "shop", "newsletter", "finance", "audit"].includes(section.id))
    || (role === "content_editor" && ["blogs", "shop"].includes(section.id))
    || (role === "finance_manager" && ["finance", "audit"].includes(section.id))
  ));

  const income = financeEntries
    .filter((entry) => entry.type === "income")
    .reduce((sum, entry) => sum + entry.amount, 0);
  const expenses = financeEntries
    .filter((entry) => entry.type === "expense")
    .reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <main id="main" className={styles.shell}>
      <aside className={styles.sidebar}>
        <AppLink className={styles.brand} href="/admin" aria-label="Colgar Admin Studio">
          <span className={styles.brandMark}>C</span>
          <span>colgar<small>ADMIN STUDIO</small></span>
        </AppLink>
        <p className={styles.sidebarLabel}>WORKSPACE</p>
        <nav className={styles.navigation} aria-label="Admin sections">
          {visibleSections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`${styles.navButton}${activeSection === section.id ? ` ${styles.navActive}` : ""}`}
              aria-current={activeSection === section.id ? "page" : undefined}
              onClick={() => setActiveSection(section.id)}
            >
              <span>{section.mark}</span>{section.label}
            </button>
          ))}
        </nav>
        <div className={styles.sidebarBottom}>
          <AppLink href={process.env.NEXT_PUBLIC_SITE_URL ?? "/"} target="_blank" rel="noreferrer">← View website</AppLink>
          <span>{role ? role.replaceAll("_", " ").toUpperCase() : "STAFF WORKSPACE"}</span>
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <div>
            <span>COLGAR FOUNDATION</span>
            <strong>Content &amp; operations</strong>
          </div>
          <div className={styles.topbarActions}>
            <span className={styles.previewTag}>{backendConfigured ? "Secure backend" : "Setup required"}</span>
            <button type="button" className={styles.logoutButton} onClick={() => void signOut()}>Sign out</button>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.pageHeading}>
            <div>
              <span className="eyebrow">Admin studio · {sections.find((item) => item.id === activeSection)?.label}</span>
              <h1>{activeSection === "overview" ? "Good morning." : sections.find((item) => item.id === activeSection)?.label}</h1>
              <p>Keep Colgar’s stories, shop, and operations moving forward.</p>
            </div>
            <span className={styles.today}>{new Date().toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>

          {backendError && <p className={styles.errorNotice} role="alert">{backendError}</p>}
          {financeMfaRequired && <p className={styles.errorNotice} role="status">Finance access is locked until you verify your authenticator code.</p>}

          {!ready ? (
            <p className={styles.loading}>Loading secure workspace…</p>
          ) : (
            <>
              {activeSection === "overview" && (
                <Overview
                  blogCount={blogPosts.filter((post) => post.status === "published").length}
                  productCount={products.filter((product) => product.visible).length}
                  subscriberCount={subscribers.length}
                  income={income}
                  expenses={expenses}
                  auditLog={auditLog}
                  onNavigate={setActiveSection}
                  role={role}
                  financeMfaRequired={financeMfaRequired}
                />
              )}
              {activeSection === "blogs" && role && ["admin", "content_editor"].includes(role) && <BlogManager />}
              {activeSection === "shop" && role && ["admin", "content_editor"].includes(role) && <ProductManager />}
              {activeSection === "newsletter" && role === "admin" && <NewsletterManager />}
              {activeSection === "finance" && role && ["admin", "finance_manager"].includes(role) && (
                financeMfaRequired
                  ? <section className={styles.panel}><PanelHeading eyebrow="Additional verification required" title="Finance ledger locked" /><p>Cloudflare Access MFA is required to view finance records.</p></section>
                  : <FinanceManager />
              )}
              {activeSection === "audit" && role && ["admin", "finance_manager"].includes(role) && <AuditManager />}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function Overview({
  blogCount,
  productCount,
  subscriberCount,
  income,
  expenses,
  auditLog,
  onNavigate,
  role,
  financeMfaRequired
}: {
  blogCount: number;
  productCount: number;
  subscriberCount: number;
  income: number;
  expenses: number;
  auditLog: AuditEntry[];
  onNavigate: (section: SectionId) => void;
  role: "admin" | "content_editor" | "finance_manager" | null;
  financeMfaRequired: boolean;
}) {
  const net = income - expenses;
  const metrics = [
    { label: "Published stories", value: String(blogCount), note: "Visible on the public blog", target: "blogs" as const },
    { label: "Active shop items", value: String(productCount), note: "Available in the shop", target: "shop" as const },
    { label: "Email subscribers", value: String(subscriberCount), note: "Confirmed subscriber records", target: "newsletter" as const },
    { label: "Ledger balance", value: formatNaira(net), note: "Based on server-side entries", target: "finance" as const }
  ].filter((metric) => (
    (role === "admin")
    || (role === "content_editor" && ["blogs", "shop"].includes(metric.target))
    || (role === "finance_manager" && metric.target === "finance")
  )).filter((metric) => !(metric.target === "finance" && financeMfaRequired));
  const shortcuts = [
    { label: "Write a new story", section: "blogs" as const, visible: role === "admin" || role === "content_editor" },
    { label: "Add a shop item", section: "shop" as const, visible: role === "admin" || role === "content_editor" },
    { label: "Prepare a subscriber email", section: "newsletter" as const, visible: role === "admin" },
    { label: "Record a finance entry", section: "finance" as const, visible: (role === "admin" || role === "finance_manager") && !financeMfaRequired }
  ].filter((shortcut) => shortcut.visible);

  return (
    <>
      <div className={styles.metrics}>
        {metrics.map((metric, index) => (
          <button className={styles.metric} key={metric.label} type="button" onClick={() => onNavigate(metric.target)}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.note}</small>
            <i aria-hidden="true">0{index + 1} ↗</i>
          </button>
        ))}
      </div>
      <div className={styles.overviewGrid}>
        <section className={styles.panel}>
          <PanelHeading eyebrow="Shortcuts" title="What needs doing?" />
          <div className={styles.shortcutList}>
            {shortcuts.map((shortcut) => (
              <button key={shortcut.section} type="button" onClick={() => onNavigate(shortcut.section)}>
                <span>{shortcut.label}</span><b>↗</b>
              </button>
            ))}
          </div>
        </section>
        <section className={styles.panel}>
          <PanelHeading eyebrow="Recent changes" title="Audit trail" action="View history" onAction={() => onNavigate("audit")} />
          {auditLog.length === 0 ? (
            <p className={styles.empty}>No changes recorded yet. Your edits will appear here.</p>
          ) : (
            <ul className={styles.recentList}>
              {auditLog.slice(0, 5).map((entry) => (
                <li key={entry.id}>
                  <span className={styles.activityDot} />
                  <span><strong>{entry.detail}</strong><small>{formatDateTime(entry.at)} · {entry.action}</small></span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function BlogManager() {
  const { blogPosts, saveBlog, setBlogStatus, deleteBlog } = useAdminContent();
  const [editorPost, setEditorPost] = useState<BlogPost | null | undefined>(undefined);

  function removePost(post: BlogPost) {
    if (window.confirm(`Delete “${post.title}”? This action cannot be undone.`)) {
      void deleteBlog(post.id);
    }
  }

  return (
    <section className={styles.panel}>
      <PanelHeading
        eyebrow={`${blogPosts.length} stories in workspace`}
        title="Blog library"
        action={editorPost === undefined ? "Create blog post +" : undefined}
        onAction={() => setEditorPost(null)}
      />
      {editorPost !== undefined && (
        <BlogEditor
          post={editorPost ?? undefined}
          onCancel={() => setEditorPost(undefined)}
          onSave={async (post) => {
            const saved = await saveBlog(post);
            if (saved) setEditorPost(undefined);
            return saved;
          }}
        />
      )}
      <div className={styles.recordList}>
        {blogPosts.map((post) => (
          <article className={styles.record} key={post.id}>
            <div className={styles.recordMain}>
              <span className={`${styles.status} ${styles[`status_${post.status}`]}`}>{post.status}</span>
              <h3>{post.title}</h3>
              <p>{post.meta} · {post.includeInNewsletter ? "Newsletter-ready" : "Not queued for email"}</p>
            </div>
            <div className={styles.rowActions}>
              <button type="button" onClick={() => setEditorPost(post)}>Edit</button>
              <button
                type="button"
                onClick={() => setBlogStatus(post.id, post.status === "published" ? "hidden" : "published")}
              >
                {post.status === "published" ? "Hide" : "Publish"}
              </button>
              <button className={styles.dangerAction} type="button" onClick={() => removePost(post)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

type BlogDraft = Omit<BlogPost, "id">;

function BlogEditor({
  post,
  onSave,
  onCancel
}: {
  post?: BlogPost;
  onSave: (post: BlogPost) => Promise<boolean>;
  onCancel: () => void;
}) {
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<BlogDraft>(() => post
    ? {
        href: post.href,
        image: post.image,
        alt: post.alt,
        meta: post.meta,
        title: post.title,
        description: post.description,
        content: post.content,
        status: post.status,
        includeInNewsletter: post.includeInNewsletter
      }
    : {
        href: "",
        image: "",
        alt: "",
        meta: "New story",
        title: "",
        description: "",
        content: "",
        status: "draft",
        includeInNewsletter: true
      });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAllowedImageUrl(draft.image.trim())) {
      setError("Use an image from this site, images.unsplash.com, or www.colgar.org.");
      return;
    }
    if (draft.href.trim() && !isSafeBlogHref(draft.href.trim())) {
      setError("Story links must use http, https, a site-relative path, or a page anchor.");
      return;
    }
    const id = post?.id ?? `${slugify(draft.title)}-${Date.now()}`;
    setError("");
    await onSave({ ...draft, id, href: draft.href.trim() || `/blog/${id}` });
  }

  return (
    <form className={styles.editor} onSubmit={handleSubmit}>
      <div className={styles.editorHeading}>
        <h3>{post ? "Edit story" : "Create a story"}</h3>
        <button type="button" className={styles.iconButton} onClick={onCancel} aria-label="Close editor">×</button>
      </div>
      <div className={styles.formGrid}>
        <Field label="Story title">
          <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required />
        </Field>
        <Field label="Category / date label">
          <input value={draft.meta} onChange={(event) => setDraft({ ...draft, meta: event.target.value })} placeholder="Community · 25 Nov 2026" />
        </Field>
        <Field label="Image URL">
          <input type="text" value={draft.image} onChange={(event) => setDraft({ ...draft, image: event.target.value })} placeholder="https://images.unsplash.com/…" required />
        </Field>
        <Field label="Image description">
          <input value={draft.alt} onChange={(event) => setDraft({ ...draft, alt: event.target.value })} required />
        </Field>
        <Field label="Story URL (optional; blank uses the on-site story)" wide>
          <input value={draft.href} onChange={(event) => setDraft({ ...draft, href: event.target.value })} placeholder="https://example.com/story" />
        </Field>
        <Field label="Short summary" wide>
          <textarea rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} required />
        </Field>
        <Field label="Full story" wide>
          <textarea rows={8} value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} required />
        </Field>
        <Field label="Visibility">
          <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as BlogStatus })}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="hidden">Hidden</option>
          </select>
        </Field>
        <label className={styles.checkField}>
          <input
            type="checkbox"
            checked={draft.includeInNewsletter}
            onChange={(event) => setDraft({ ...draft, includeInNewsletter: event.target.checked })}
          />
          Include in subscriber emails
        </label>
      </div>
      {error && <p className={styles.errorNotice} role="alert">{error}</p>}
      <div className={styles.editorActions}>
        <button className={styles.primaryButton} type="submit">{post ? "Save changes" : "Create story"}</button>
        <button className={styles.secondaryButton} type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function ProductManager() {
  const { products, saveProduct, setProductVisibility, deleteProduct } = useAdminContent();
  const [editorProduct, setEditorProduct] = useState<ManagedProduct | null | undefined>(undefined);

  function removeProduct(product: ManagedProduct) {
    if (window.confirm(`Delete “${product.title}”? This action cannot be undone.`)) {
      void deleteProduct(product.slug);
    }
  }

  return (
    <section className={styles.panel}>
      <PanelHeading
        eyebrow={`${products.length} items in workspace`}
        title="Shop inventory"
        action={editorProduct === undefined ? "Add item +" : undefined}
        onAction={() => setEditorProduct(null)}
      />
      {editorProduct !== undefined && (
        <ProductEditor
          product={editorProduct ?? undefined}
          onCancel={() => setEditorProduct(undefined)}
          onSave={async (product) => {
            const saved = await saveProduct(product);
            if (saved) setEditorProduct(undefined);
            return saved;
          }}
          existingSlugs={products.map((product) => product.slug)}
        />
      )}
      <div className={styles.recordList}>
        {products.map((product) => (
          <article className={styles.record} key={product.slug}>
            <div className={styles.recordMain}>
              <span className={`${styles.status} ${product.visible ? styles.status_published : styles.status_hidden}`}>
                {product.visible ? "Visible" : "Hidden"}
              </span>
              <h3>{product.title}</h3>
              <p>{product.category.replaceAll("-", " ")} · {product.priceLabel}</p>
            </div>
            <div className={styles.rowActions}>
              <button type="button" onClick={() => setEditorProduct(product)}>Edit</button>
              <button type="button" onClick={() => setProductVisibility(product.slug, !product.visible)}>
                {product.visible ? "Hide" : "Show"}
              </button>
              <button className={styles.dangerAction} type="button" onClick={() => removeProduct(product)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

type ProductDraft = {
  title: string;
  price: string;
  category: ProductCategory;
  image: string;
  alt: string;
  description: string;
  details: string;
  options: string;
  visible: boolean;
};

function ProductEditor({
  product,
  existingSlugs,
  onSave,
  onCancel
}: {
  product?: ManagedProduct;
  existingSlugs: string[];
  onSave: (product: ManagedProduct) => Promise<boolean>;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<ProductDraft>(() => product
    ? {
        title: product.title,
        price: String(product.price),
        category: product.category,
        image: product.image,
        alt: product.alt,
        description: product.description,
        details: product.details.join("\n"),
        options: product.options?.map((option) => `${option.label} | ${option.price}${option.impact ? ` | ${option.impact}` : ""}`).join("\n") ?? "",
        visible: product.visible
      }
    : {
        title: "",
        price: "",
        category: "shirts",
        image: "",
        alt: "",
        description: "",
        details: "",
        options: "",
        visible: true
      });
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const price = Number(draft.price);
    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a price greater than zero.");
      return;
    }
    if (!isAllowedImageUrl(draft.image.trim())) {
      setError("Use an image from this site, images.unsplash.com, or www.colgar.org.");
      return;
    }

    const options = draft.options.trim()
      ? draft.options.trim().split(/\r?\n/).map((line) => {
          const [label, rawPrice, ...impactParts] = line.split("|").map((part) => part.trim());
          const optionPrice = Number(rawPrice);
          if (!label || !Number.isFinite(optionPrice) || optionPrice <= 0) return null;
          return {
            label,
            price: optionPrice,
            ...(impactParts.join(" | ") ? { impact: impactParts.join(" | ") } : {})
          };
        })
      : [];
    if (options.some((option) => option === null)) {
      setError("Options must use one per line in the format: Size | price | optional note.");
      return;
    }

    let slug = product?.slug ?? slugify(draft.title);
    if (!product && existingSlugs.includes(slug)) slug = `${slug}-${Date.now()}`;
    const optionValues = options.filter((option): option is NonNullable<typeof option> => option !== null);
    const optionPrices = optionValues.map((option) => option.price);
    const minPrice = optionPrices.length ? Math.min(...optionPrices) : price;
    const maxPrice = optionPrices.length ? Math.max(...optionPrices) : price;
    const priceLabel = minPrice === maxPrice
      ? formatNaira(minPrice)
      : `${formatNaira(minPrice)} – ${formatNaira(maxPrice)}`;
    setError("");
    await onSave({
      slug,
      title: draft.title.trim(),
      price: minPrice,
      priceLabel,
      image: draft.image.trim(),
      alt: draft.alt.trim(),
      category: draft.category,
      description: draft.description.trim(),
      details: draft.details.split(/\r?\n/).map((detail) => detail.trim()).filter(Boolean),
      ...(optionValues.length ? { options: optionValues } : {}),
      visible: draft.visible
    });
  }

  return (
    <form className={styles.editor} onSubmit={handleSubmit}>
      <div className={styles.editorHeading}>
        <h3>{product ? "Edit shop item" : "Add a shop item"}</h3>
        <button type="button" className={styles.iconButton} onClick={onCancel} aria-label="Close editor">×</button>
      </div>
      <div className={styles.formGrid}>
        <Field label="Item name">
          <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required />
        </Field>
        <Field label="Base price (NGN)">
          <input type="number" min="1" step="1" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} required />
        </Field>
        <Field label="Merch type">
          <select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as ProductCategory })}>
            {productCategories.filter((category) => category.value !== "all").map((category) => (
              <option value={category.value} key={category.value}>{category.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Image URL">
          <input type="text" value={draft.image} onChange={(event) => setDraft({ ...draft, image: event.target.value })} placeholder="https://images.unsplash.com/…" required />
        </Field>
        <Field label="Image description">
          <input value={draft.alt} onChange={(event) => setDraft({ ...draft, alt: event.target.value })} required />
        </Field>
        <Field label="Description" wide>
          <textarea rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} required />
        </Field>
        <Field label="Item details (one per line)">
          <textarea rows={4} value={draft.details} onChange={(event) => setDraft({ ...draft, details: event.target.value })} />
        </Field>
        <Field label="Options (one per line: label | price | optional note)">
          <textarea rows={4} value={draft.options} onChange={(event) => setDraft({ ...draft, options: event.target.value })} placeholder={"Small | 15000\nLarge | 18000"} />
        </Field>
        <label className={styles.checkField}>
          <input type="checkbox" checked={draft.visible} onChange={(event) => setDraft({ ...draft, visible: event.target.checked })} />
          Show this item in the public shop
        </label>
      </div>
      {error && <p className={styles.errorNotice} role="alert">{error}</p>}
      <div className={styles.editorActions}>
        <button className={styles.primaryButton} type="submit">{product ? "Save item" : "Create item"}</button>
        <button className={styles.secondaryButton} type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function NewsletterManager() {
  const { blogPosts, subscribers, unsubscribe } = useAdminContent();
  const eligiblePosts = blogPosts.filter((post) => post.status === "published" && post.includeInNewsletter);
  const [selectedPostId, setSelectedPostId] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const selectedPost = eligiblePosts.find((post) => post.id === selectedPostId) ?? eligiblePosts[0];

  async function sendStory() {
    if (!selectedPost || subscribers.length === 0) return;
    setSending(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: selectedPost.id })
      });
      const result = await response.json() as { message?: string; error?: string };
      setMessage(response.ok ? result.message ?? "Newsletter sent." : result.error ?? "Newsletter sending failed.");
    } catch (error) {
      console.error("Could not send a Colgar story email.", error);
      setMessage("The email service could not be reached. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function exportSubscribers() {
    downloadCsv("colgar-subscribers.csv", ["Email", "Subscribed at"], subscribers.map((subscriber) => [
      subscriber.email,
      subscriber.subscribedAt
    ]));
  }

  return (
    <div className={styles.newsletterLayout}>
      <section className={styles.panel}>
        <PanelHeading eyebrow="Newsletter" title="Send a Colgar story" />
        <div className={styles.emailCard}>
          <span className="eyebrow">{subscribers.length} subscriber{subscribers.length === 1 ? "" : "s"}</span>
          {eligiblePosts.length > 0 ? (
            <>
              {eligiblePosts.length > 1 && (
                <Field label="Choose a story">
                  <select value={selectedPost?.id ?? ""} onChange={(event) => setSelectedPostId(event.target.value)}>
                    {eligiblePosts.map((post) => <option value={post.id} key={post.id}>{post.title}</option>)}
                  </select>
                </Field>
              )}
              <h3>{selectedPost.title}</h3>
              <p>{selectedPost.description}</p>
              <p className={styles.mutedNote}>Only published posts marked “Include in subscriber emails” appear here.</p>
              <button
                className={styles.primaryButton}
                type="button"
                disabled={subscribers.length === 0 || sending}
                onClick={() => void sendStory()}
              >
                {sending ? "Sending…" : "Send story to subscribers"} <span aria-hidden="true">↗</span>
              </button>
            </>
          ) : (
            <p className={styles.empty}>No newsletter-ready published stories. Edit a blog post and enable subscriber email inclusion.</p>
          )}
          {message && <p className={styles.successNotice} role="status">{message}</p>}
          <p className={styles.mutedNote}>Messages are sent individually so subscribers do not see one another’s addresses.</p>
        </div>
      </section>
      <section className={styles.panel}>
        <PanelHeading
          eyebrow={`${subscribers.length} active`}
          title="Subscriber list"
          action={subscribers.length > 0 ? "Export CSV ↓" : undefined}
          onAction={exportSubscribers}
        />
        {subscribers.length === 0 ? (
          <p className={styles.empty}>No subscribers yet. Visitors can subscribe from the public blog page.</p>
        ) : (
          <div className={styles.recordList}>
            {subscribers.map((subscriber) => (
              <article className={styles.record} key={subscriber.id}>
                <div className={styles.recordMain}>
                  <h3>{subscriber.email}</h3>
                  <p>Joined {formatDate(subscriber.subscribedAt)}</p>
                </div>
                <div className={styles.rowActions}>
                  <button className={styles.dangerAction} type="button" onClick={() => unsubscribe(subscriber.id)}>Remove</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FinanceManager() {
  const { financeEntries, saveFinanceEntry, deleteFinanceEntry } = useAdminContent();
  const [editing, setEditing] = useState<FinanceEntry | null | undefined>(undefined);
  const income = financeEntries.filter((entry) => entry.type === "income").reduce((sum, entry) => sum + entry.amount, 0);
  const expenses = financeEntries.filter((entry) => entry.type === "expense").reduce((sum, entry) => sum + entry.amount, 0);
  const orderedEntries = useMemo(
    () => [...financeEntries].sort((a, b) => b.date.localeCompare(a.date)),
    [financeEntries]
  );

  function exportLedger() {
    downloadCsv("colgar-finance-ledger.csv", ["Date", "Type", "Category", "Amount (NGN)", "Note"], orderedEntries.map((entry) => [
      entry.date,
      entry.type,
      entry.category,
      String(entry.amount),
      entry.note
    ]));
  }

  function removeEntry(entry: FinanceEntry) {
    if (window.confirm(`Delete the ${entry.type} entry for ${formatNaira(entry.amount)}?`)) {
      void deleteFinanceEntry(entry.id);
    }
  }

  return (
    <>
      <div className={styles.financeTotals}>
        <TotalCard label="Income recorded" value={formatNaira(income)} tone="positive" />
        <TotalCard label="Expenses recorded" value={formatNaira(expenses)} tone="negative" />
        <TotalCard label="Net balance" value={formatNaira(income - expenses)} />
      </div>
      <section className={styles.panel}>
        <PanelHeading
          eyebrow={`${financeEntries.length} ledger entries`}
          title="Finance history"
          action={financeEntries.length > 0 ? "Export CSV ↓" : undefined}
          onAction={exportLedger}
        />
        <p className={styles.mutedNote}>Record reconciled income and expenses. Entries are stored in the protected finance ledger.</p>
        {editing !== undefined && (
          <FinanceEditor
            key={editing?.id ?? "new-entry"}
            entry={editing ?? undefined}
            onCancel={() => setEditing(undefined)}
            onSave={async (entry) => {
              const saved = await saveFinanceEntry(entry);
              if (saved) setEditing(undefined);
              return saved;
            }}
          />
        )}
        <div className={styles.toolbar}>
          <span className={styles.tableLabel}>Recent transactions</span>
          <button className={styles.secondaryButton} type="button" onClick={() => setEditing(null)}>Add record +</button>
        </div>
        {orderedEntries.length === 0 ? (
          <p className={styles.empty}>No finance records yet. Add an income or expense entry to start the history.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Date</th><th>Transaction</th><th>Category</th><th>Amount</th><th /></tr></thead>
              <tbody>
                {orderedEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatDate(entry.date)}</td>
                    <td><span className={`${styles.typeTag} ${entry.type === "income" ? styles.incomeTag : styles.expenseTag}`}>{entry.type}</span><small>{entry.note}</small></td>
                    <td>{entry.category}</td>
                    <td className={entry.type === "income" ? styles.amountIncome : styles.amountExpense}>{formatNaira(entry.amount)}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button type="button" onClick={() => setEditing(entry)}>Edit</button>
                        <button className={styles.dangerAction} type="button" onClick={() => removeEntry(entry)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function FinanceEditor({
  entry,
  onSave,
  onCancel
}: {
  entry?: FinanceEntry;
  onSave: (entry: FinanceEntry) => Promise<boolean>;
  onCancel: () => void;
}) {
  const [type, setType] = useState<FinanceEntry["type"]>(entry?.type ?? "income");
  const [date, setDate] = useState(entry?.date ?? new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState(entry?.category ?? "Donation");
  const [amount, setAmount] = useState(entry ? String(entry.amount) : "");
  const [note, setNote] = useState(entry?.note ?? "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return;
    await onSave({
      id: entry?.id ?? crypto.randomUUID(),
      type,
      date,
      category,
      amount: parsedAmount,
      note: note.trim()
    });
  }

  return (
    <form className={styles.editor} onSubmit={handleSubmit}>
      <div className={styles.editorHeading}>
        <h3>{entry ? "Edit finance record" : "Add finance record"}</h3>
        <button type="button" className={styles.iconButton} onClick={onCancel} aria-label="Close editor">×</button>
      </div>
      <div className={styles.formGrid}>
        <Field label="Record type">
          <select value={type} onChange={(event) => setType(event.target.value as FinanceEntry["type"])}>
            <option value="income">Income</option><option value="expense">Expense</option>
          </select>
        </Field>
        <Field label="Date">
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
        </Field>
        <Field label="Category">
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option>Donation</option><option>Shop sale</option><option>Campaign</option><option>Operations</option><option>Transport</option><option>Other</option>
          </select>
        </Field>
        <Field label="Amount (NGN)">
          <input type="number" min="1" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} required />
        </Field>
        <Field label="Note / reference" wide>
          <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Short description for the ledger" required />
        </Field>
      </div>
      <div className={styles.editorActions}>
        <button className={styles.primaryButton} type="submit">{entry ? "Save record" : "Add record"}</button>
        <button className={styles.secondaryButton} type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function AuditManager() {
  const { auditLog } = useAdminContent();

  return (
    <section className={styles.panel}>
      <PanelHeading eyebrow={`${auditLog.length} events · latest first`} title="Audit history" />
      <p className={styles.mutedNote}>Changes are recorded by database triggers and are restricted to authorized staff.</p>
      {auditLog.length === 0 ? (
        <p className={styles.empty}>No activity yet. Blog, shop, subscriber, and finance changes will be listed here.</p>
      ) : (
        <div className={styles.auditList}>
          {auditLog.map((entry) => (
            <article className={styles.auditRow} key={entry.id}>
              <span className={styles.auditMark}>{actionMark(entry.action)}</span>
              <div><strong>{entry.detail}</strong><small>{entry.entity} · {entry.action}</small></div>
              <time dateTime={entry.at}>{formatDateTime(entry.at)}</time>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function PanelHeading({
  eyebrow,
  title,
  action,
  onAction
}: {
  eyebrow: string;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className={styles.panelHeading}>
      <div><span className={styles.panelEyebrow}>{eyebrow}</span><h2>{title}</h2></div>
      {action && onAction && <button className={styles.headingAction} type="button" onClick={onAction}>{action}</button>}
    </div>
  );
}

function Field({ label, wide = false, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={`${styles.field}${wide ? ` ${styles.fieldWide}` : ""}`}><span>{label}</span>{children}</label>;
}

function TotalCard({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "positive" | "negative" | "neutral" }) {
  return <div className={styles.totalCard}><span>{label}</span><strong className={styles[`total_${tone}`]}>{value}</strong></div>;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "new-item";
}

function formatDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function actionMark(action: AuditEntry["action"]) {
  if (action === "deleted") return "−";
  if (action === "hidden") return "○";
  if (action === "published") return "↗";
  if (action === "subscribed") return "+";
  if (action === "unsubscribed") return "−";
  if (action === "created") return "+";
  return "✓";
}

function downloadCsv(filename: string, headings: string[], rows: string[][]) {
  const escapeCell = (value: string) => {
    const safeValue = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
    return `"${safeValue.replaceAll('"', '""')}"`;
  };
  const csv = [headings, ...rows].map((row) => row.map(escapeCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
