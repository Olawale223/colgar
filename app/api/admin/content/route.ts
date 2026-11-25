import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isSafeBlogHref, isAllowedImageUrl } from "@/data/contentValidation";
import { productCategories, type ProductCategory } from "@/data/products";
import { isRecord, readJson, RequestInputError } from "@/lib/server/http";
import {
  mapAuditRow,
  mapBlogRow,
  mapFinanceRow,
  mapProductRow,
  mapSubscriberRow,
  type BlogRow,
  type ProductRow
} from "@/lib/server/content-mappers";
import { getStaffSession, type StaffRole } from "@/lib/server/staff-session";
import { mongoCommand } from "@/lib/server/mongo-store";

const contentRoles: StaffRole[] = ["admin", "content_editor"];
const financeRoles: StaffRole[] = ["admin", "finance_manager"];

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

function auditRecord(entity: string, action: string, detail: string, actorId: string) {
  return {
    id: randomUUID(),
    actor_id: actorId,
    entity,
    action,
    detail,
    created_at: new Date().toISOString()
  };
}

export async function GET() {
  const session = await getStaffSession();
  if (!session.user) return errorResponse(session.error, session.status);

  const role = session.user.role;
  const canEditContent = contentRoles.includes(role);
  const canReadFinance = financeRoles.includes(role);
  try {
    const [blogs, productRows, subscriberRows, financeRows, auditRows] = await Promise.all([
      canEditContent
        ? mongoCommand<BlogRow[]>({ action: "find", collection: "blog_posts", filter: {}, sort: { updated_at: -1 } })
        : Promise.resolve([]),
      canEditContent
        ? mongoCommand<ProductRow[]>({ action: "find", collection: "products", filter: {}, sort: { updated_at: -1 } })
        : Promise.resolve([]),
      role === "admin"
        ? mongoCommand<Array<{ id: string; email: string; created_at: string }>>({
          action: "find", collection: "subscribers", filter: { status: "active" },
          sort: { created_at: -1 }, projection: { id: 1, email: 1, created_at: 1 }
        })
        : Promise.resolve([]),
      canReadFinance
        ? mongoCommand<Array<{ id: string; date: string; type: "income" | "expense"; category: string; amount: number; note: string }>>({
          action: "find", collection: "finance_entries", filter: {},
          sort: { date: -1 }, projection: { id: 1, date: 1, type: 1, category: 1, amount: 1, note: 1 }
        })
        : Promise.resolve([]),
      role === "admin" || role === "finance_manager"
        ? mongoCommand<Array<{ id: string; created_at: string; action: "created" | "updated" | "published" | "hidden" | "deleted" | "subscribed" | "unsubscribed"; entity: string; detail: string }>>({
          action: "find", collection: "audit_events", filter: {},
          sort: { created_at: -1 }, limit: 300,
          projection: { id: 1, created_at: 1, action: 1, entity: 1, detail: 1 }
        })
        : Promise.resolve([])
    ]);

    return NextResponse.json({
      blogPosts: blogs.map(mapBlogRow),
      products: productRows.map(mapProductRow),
      subscribers: subscriberRows.map(mapSubscriberRow),
      financeEntries: financeRows.map(mapFinanceRow),
      auditLog: auditRows.map(mapAuditRow),
      role,
      financeMfaRequired: false
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Could not load Colgar admin data from MongoDB.", error);
    return errorResponse("Admin data could not be loaded.", 503);
  }
}

export async function POST(request: Request) {
  const session = await getStaffSession();
  if (!session.user) return errorResponse(session.error, session.status);

  const role = session.user.role;
  try {
    const body = await readJson(request, 128_000);
    if (!isRecord(body) || typeof body.operation !== "string" || !isRecord(body.payload)) {
      throw new RequestInputError("The requested change is not valid.");
    }

    const payload = body.payload;
    switch (body.operation) {
      case "blog.save": {
        requireRole(role, contentRoles, "Content editing is not allowed for this account.");
        const row = validateBlog(nestedRecord(payload, "post"));
        const existing = await mongoCommand<BlogRow | null>({
          action: "findOne", collection: "blog_posts", filter: { id: row.id }, projection: { id: 1 }
        });
        await mongoCommand({
          action: "adminMutation",
          mutation: {
            action: "updateOne", collection: "blog_posts", filter: { id: row.id },
            update: { $set: { ...row, updated_at: new Date().toISOString() }, $setOnInsert: { created_at: new Date().toISOString() } },
            upsert: true
          },
          audit: auditRecord("blog", existing ? "updated" : "created", row.title, session.user.id)
        });
        break;
      }
      case "blog.status": {
        requireRole(role, contentRoles, "Content editing is not allowed for this account.");
        if (typeof payload.id !== "string" || !["published", "draft", "hidden"].includes(String(payload.status))) {
          throw new RequestInputError("The story status is not valid.");
        }
        const action = payload.status === "published" ? "published" : payload.status === "hidden" ? "hidden" : "updated";
        const result = await mongoCommand<{ matchedCount: number }>({
          action: "adminMutation",
          mutation: {
            action: "updateOne", collection: "blog_posts", filter: { id: payload.id },
            update: { $set: { status: payload.status, updated_at: new Date().toISOString() } }
          },
          audit: auditRecord("blog", action, `Story ${payload.id} set to ${payload.status}`, session.user.id)
        });
        if (!result.matchedCount) return errorResponse("The story could not be found.", 404);
        break;
      }
      case "blog.delete": {
        requireRole(role, contentRoles, "Content editing is not allowed for this account.");
        if (typeof payload.id !== "string") throw new RequestInputError("A story id is required.");
        const result = await mongoCommand<{ deletedCount: number }>({
          action: "adminMutation",
          mutation: { action: "deleteOne", collection: "blog_posts", filter: { id: payload.id } },
          audit: auditRecord("blog", "deleted", `Story ${payload.id}`, session.user.id)
        });
        if (!result.deletedCount) return errorResponse("The story could not be found.", 404);
        break;
      }
      case "product.save": {
        requireRole(role, contentRoles, "Shop editing is not allowed for this account.");
        const row = validateProduct(nestedRecord(payload, "product"));
        const existing = await mongoCommand<ProductRow | null>({
          action: "findOne", collection: "products", filter: { slug: row.slug }, projection: { slug: 1 }
        });
        await mongoCommand({
          action: "adminMutation",
          mutation: {
            action: "updateOne", collection: "products", filter: { slug: row.slug },
            update: { $set: { ...row, updated_at: new Date().toISOString() }, $setOnInsert: { created_at: new Date().toISOString() } },
            upsert: true
          },
          audit: auditRecord("product", existing ? "updated" : "created", row.title, session.user.id)
        });
        break;
      }
      case "product.visibility": {
        requireRole(role, contentRoles, "Shop editing is not allowed for this account.");
        if (typeof payload.slug !== "string" || typeof payload.visible !== "boolean") {
          throw new RequestInputError("The product visibility is not valid.");
        }
        const result = await mongoCommand<{ matchedCount: number }>({
          action: "adminMutation",
          mutation: {
            action: "updateOne", collection: "products", filter: { slug: payload.slug },
            update: { $set: { visible: payload.visible, updated_at: new Date().toISOString() } }
          },
          audit: auditRecord("product", payload.visible ? "updated" : "hidden", `Product ${payload.slug}`, session.user.id)
        });
        if (!result.matchedCount) return errorResponse("The product could not be found.", 404);
        break;
      }
      case "product.delete": {
        requireRole(role, contentRoles, "Shop editing is not allowed for this account.");
        if (typeof payload.slug !== "string") throw new RequestInputError("A product slug is required.");
        const result = await mongoCommand<{ deletedCount: number }>({
          action: "adminMutation",
          mutation: { action: "deleteOne", collection: "products", filter: { slug: payload.slug } },
          audit: auditRecord("product", "deleted", `Product ${payload.slug}`, session.user.id)
        });
        if (!result.deletedCount) return errorResponse("The product could not be found.", 404);
        break;
      }
      case "subscriber.remove": {
        requireRole(role, ["admin"], "Subscriber management is not allowed for this account.");
        if (typeof payload.id !== "string") throw new RequestInputError("A subscriber id is required.");
        const result = await mongoCommand<{ matchedCount: number }>({
          action: "adminMutation",
          mutation: {
            action: "updateOne", collection: "subscribers", filter: { id: payload.id },
            update: { $set: { status: "unsubscribed", updated_at: new Date().toISOString() } }
          },
          audit: auditRecord("subscriber", "unsubscribed", `Subscriber ${payload.id}`, session.user.id)
        });
        if (!result.matchedCount) return errorResponse("The subscriber could not be found.", 404);
        break;
      }
      case "finance.save": {
        requireRole(role, financeRoles, "Finance management is not allowed for this account.");
        const row = validateFinance(nestedRecord(payload, "entry"), session.user.id);
        const id = row.id ?? randomUUID();
        const existing = await mongoCommand<{ id: string } | null>({
          action: "findOne", collection: "finance_entries", filter: { id }, projection: { id: 1 }
        });
        await mongoCommand({
          action: "adminMutation",
          mutation: {
            action: "updateOne", collection: "finance_entries", filter: { id },
            update: { $set: { ...row, id, updated_at: new Date().toISOString() }, $setOnInsert: { created_at: new Date().toISOString() } },
            upsert: true
          },
          audit: auditRecord("finance", existing ? "updated" : "created", `${row.type} · ${row.category} · ${row.amount}`, session.user.id)
        });
        break;
      }
      case "finance.delete": {
        requireRole(role, financeRoles, "Finance management is not allowed for this account.");
        if (typeof payload.id !== "string" || !isUuid(payload.id)) throw new RequestInputError("A finance record id is required.");
        const result = await mongoCommand<{ deletedCount: number }>({
          action: "adminMutation",
          mutation: { action: "deleteOne", collection: "finance_entries", filter: { id: payload.id } },
          audit: auditRecord("finance", "deleted", `Finance entry ${payload.id}`, session.user.id)
        });
        if (!result.deletedCount) return errorResponse("The finance record could not be found.", 404);
        break;
      }
      default:
        throw new RequestInputError("The requested change is not supported.");
    }

    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof RequestInputError) return errorResponse(error.message, error.status);
    console.error("Colgar admin operation failed.", error);
    return errorResponse("The change could not be saved.", 503);
  }
}

function requireRole(role: StaffRole, roles: StaffRole[], message: string) {
  if (!roles.includes(role)) throw new RequestInputError(message, 403);
}

function nestedRecord(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  if (!isRecord(value)) throw new RequestInputError("The requested content is incomplete.");
  return value;
}

function validateBlog(value: Record<string, unknown>) {
  if (typeof value.id !== "string" || !/^[a-z0-9][a-z0-9-]{0,119}$/.test(value.id)
    || typeof value.title !== "string" || value.title.length < 1 || value.title.length > 240
    || typeof value.href !== "string" || !isSafeBlogHref(value.href)
    || typeof value.image !== "string" || !isAllowedImageUrl(value.image)
    || typeof value.alt !== "string" || value.alt.length > 500
    || typeof value.meta !== "string" || value.meta.length > 240
    || typeof value.description !== "string" || value.description.length > 4000
    || typeof value.content !== "string" || value.content.length > 50_000
    || !["published", "draft", "hidden"].includes(String(value.status))
    || typeof value.includeInNewsletter !== "boolean") {
    throw new RequestInputError("The story content is incomplete or invalid.");
  }
  return {
    id: value.id,
    href: value.href,
    image: value.image,
    alt: value.alt,
    meta: value.meta,
    title: value.title,
    description: value.description,
    content: value.content,
    status: value.status,
    include_in_newsletter: value.includeInNewsletter
  };
}

function validateProduct(value: Record<string, unknown>) {
  if (typeof value.slug !== "string" || !/^[a-z0-9][a-z0-9-]{0,119}$/.test(value.slug)
    || typeof value.title !== "string" || value.title.length < 1 || value.title.length > 240
    || typeof value.price !== "number" || !Number.isFinite(value.price) || value.price <= 0 || value.price > 50_000_000
    || typeof value.priceLabel !== "string" || value.priceLabel.length > 80
    || typeof value.image !== "string" || !isAllowedImageUrl(value.image)
    || typeof value.alt !== "string" || value.alt.length > 500
    || typeof value.category !== "string" || !productCategories.some((category) => category.value === value.category)
    || typeof value.description !== "string" || value.description.length > 4000
    || !Array.isArray(value.details) || value.details.some((item) => typeof item !== "string" || item.length > 500)
    || (value.options !== undefined && value.options !== null && (!Array.isArray(value.options) || value.options.some((option) =>
      !isRecord(option) || typeof option.label !== "string" || option.label.length > 120
      || typeof option.price !== "number" || !Number.isFinite(option.price) || option.price <= 0
      || (option.impact !== undefined && (typeof option.impact !== "string" || option.impact.length > 500))
    )))
    || typeof value.visible !== "boolean") {
    throw new RequestInputError("The product details are incomplete or invalid.");
  }
  return {
    slug: value.slug,
    title: value.title,
    price: value.price,
    price_label: value.priceLabel,
    image: value.image,
    alt: value.alt,
    category: value.category as ProductCategory,
    description: value.description,
    details: value.details,
    options: value.options ?? null,
    visible: value.visible
  };
}

function validateFinance(value: Record<string, unknown>, userId: string) {
  const id = typeof value.id === "string" && isUuid(value.id) ? value.id : undefined;
  if (typeof value.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.date)
    || !["income", "expense"].includes(String(value.type))
    || typeof value.category !== "string" || value.category.length < 1 || value.category.length > 80
    || typeof value.amount !== "number" || !Number.isFinite(value.amount) || value.amount <= 0 || value.amount > 50_000_000
    || typeof value.note !== "string" || value.note.length > 1000) {
    throw new RequestInputError("The finance entry is incomplete or invalid.");
  }
  return {
    ...(id ? { id } : {}),
    date: value.date,
    type: value.type,
    category: value.category,
    amount: value.amount,
    note: value.note,
    created_by: userId
  };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
