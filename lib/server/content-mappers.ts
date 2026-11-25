import type { BlogPost } from "@/data/blogPosts";
import type { Product, ProductOption } from "@/data/products";
import type { AuditEntry, FinanceEntry, ManagedProduct, Subscriber } from "@/components/AdminContentProvider";

export type BlogRow = {
  id: string;
  href: string;
  image: string;
  alt: string;
  meta: string;
  title: string;
  description: string;
  content: string;
  status: BlogPost["status"];
  include_in_newsletter: boolean;
};

export type ProductRow = {
  slug: string;
  title: string;
  price: number;
  price_label: string;
  image: string;
  alt: string;
  category: Product["category"];
  description: string;
  details: string[];
  options: ProductOption[] | null;
  visible: boolean;
};

export function mapBlogRow(row: BlogRow): BlogPost {
  return {
    id: row.id,
    href: row.href,
    image: row.image,
    alt: row.alt,
    meta: row.meta,
    title: row.title,
    description: row.description,
    content: row.content,
    status: row.status,
    includeInNewsletter: row.include_in_newsletter
  };
}

export function mapProductRow(row: ProductRow): ManagedProduct {
  return {
    slug: row.slug,
    title: row.title,
    price: Number(row.price),
    priceLabel: row.price_label,
    image: row.image,
    alt: row.alt,
    category: row.category,
    description: row.description,
    details: row.details,
    ...(row.options ? { options: row.options } : {}),
    visible: row.visible
  };
}

export function mapSubscriberRow(row: { id: string; email: string; created_at: string }): Subscriber {
  return { id: row.id, email: row.email, subscribedAt: row.created_at };
}

export function mapFinanceRow(row: {
  id: string;
  date: string;
  type: FinanceEntry["type"];
  category: string;
  amount: number;
  note: string;
}): FinanceEntry {
  return { ...row, amount: Number(row.amount) };
}

export function mapAuditRow(row: {
  id: string;
  created_at: string;
  action: AuditEntry["action"];
  entity: string;
  detail: string;
}): AuditEntry {
  return { id: row.id, at: row.created_at, action: row.action, entity: row.entity as AuditEntry["entity"], detail: row.detail };
}
