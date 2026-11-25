"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { usePathname } from "next/navigation";
import { initialBlogPosts, type BlogPost, type BlogStatus } from "@/data/blogPosts";
import { products, type Product, type ProductCategory } from "@/data/products";

export type ManagedProduct = Product & { visible: boolean };
export type Subscriber = { id: string; email: string; subscribedAt: string };
export type FinanceEntry = {
  id: string;
  date: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  note: string;
};
export type AuditEntry = {
  id: string;
  at: string;
  action: "created" | "updated" | "published" | "hidden" | "deleted" | "subscribed" | "unsubscribed";
  entity: "blog" | "product" | "subscriber" | "finance" | "orders";
  detail: string;
};
export type StaffRole = "admin" | "content_editor" | "finance_manager";

type AdminContentState = {
  blogPosts: BlogPost[];
  products: ManagedProduct[];
  subscribers: Subscriber[];
  financeEntries: FinanceEntry[];
  auditLog: AuditEntry[];
};

type AdminContentContextValue = AdminContentState & {
  ready: boolean;
  role: StaffRole | null;
  backendConfigured: boolean;
  financeMfaRequired: boolean;
  backendError: string;
  saveBlog: (post: BlogPost) => Promise<boolean>;
  setBlogStatus: (id: string, status: BlogStatus) => Promise<boolean>;
  deleteBlog: (id: string) => Promise<boolean>;
  saveProduct: (product: ManagedProduct) => Promise<boolean>;
  setProductVisibility: (slug: string, visible: boolean) => Promise<boolean>;
  deleteProduct: (slug: string) => Promise<boolean>;
  subscribe: (email: string, consent: boolean) => Promise<{ ok: boolean; message: string }>;
  unsubscribe: (id: string) => Promise<boolean>;
  saveFinanceEntry: (entry: FinanceEntry) => Promise<boolean>;
  deleteFinanceEntry: (id: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  reload: () => Promise<void>;
};

const AdminContentContext = createContext<AdminContentContextValue | null>(null);

function initialState(): AdminContentState {
  return {
    blogPosts: initialBlogPosts,
    products: products.map((product) => ({ ...product, visible: true })),
    subscribers: [],
    financeEntries: [],
    auditLog: []
  };
}

function emptyState(): AdminContentState {
  return { blogPosts: [], products: [], subscribers: [], financeEntries: [], auditLog: [] };
}

export function AdminContentProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const adminLogin = pathname === "/admin/login";
  const adminPage = pathname.startsWith("/admin") && !adminLogin;
  const [state, setState] = useState(initialState);
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<StaffRole | null>(null);
  const [backendConfigured, setBackendConfigured] = useState(false);
  const [financeMfaRequired, setFinanceMfaRequired] = useState(false);
  const [backendError, setBackendError] = useState("");

  const reload = useCallback(async () => {
    setReady(false);
    setBackendConfigured(false);
    setBackendError("");
    setFinanceMfaRequired(false);
    if (adminLogin) {
      setState(emptyState());
      setRole(null);
      setReady(true);
      return;
    }

    const endpoint = adminPage ? "/api/admin/content" : "/api/public/content";
    try {
      const response = await fetch(endpoint, { cache: adminPage ? "no-store" : "force-cache" });
      const body = await response.json() as Partial<AdminContentState> & {
        role?: StaffRole;
        financeMfaRequired?: boolean;
        error?: string;
      };
      if (!response.ok) {
        setState(adminPage ? emptyState() : initialState());
        setBackendError(body.error ?? "The content service is unavailable.");
        return;
      }

      setBackendConfigured(true);
      setState({
        blogPosts: body.blogPosts ?? [],
        products: body.products ?? [],
        subscribers: body.subscribers ?? [],
        financeEntries: body.financeEntries ?? [],
        auditLog: body.auditLog ?? []
      });
      setRole(body.role ?? null);
      setFinanceMfaRequired(body.financeMfaRequired ?? false);
    } catch (error) {
      console.error("Could not load Colgar backend content.", error);
      setState(adminPage ? emptyState() : initialState());
      setBackendError("The content service could not be reached. Please try again.");
    } finally {
      setReady(true);
    }
  }, [adminLogin, adminPage]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const mutate = useCallback(async (operation: string, payload: Record<string, unknown>) => {
    setBackendError("");
    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation, payload })
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        setBackendError(result.error ?? "The requested change could not be saved.");
        return false;
      }
      await reload();
      return true;
    } catch (error) {
      console.error(`Colgar admin operation ${operation} failed.`, error);
      setBackendError("The change could not be saved because the backend could not be reached.");
      return false;
    }
  }, [reload]);

  const saveBlog = useCallback((post: BlogPost) => mutate("blog.save", { post }), [mutate]);
  const setBlogStatus = useCallback((id: string, status: BlogStatus) => mutate("blog.status", { id, status }), [mutate]);
  const deleteBlog = useCallback((id: string) => mutate("blog.delete", { id }), [mutate]);
  const saveProduct = useCallback((product: ManagedProduct) => mutate("product.save", { product }), [mutate]);
  const setProductVisibility = useCallback(
    (slug: string, visible: boolean) => mutate("product.visibility", { slug, visible }),
    [mutate]
  );
  const deleteProduct = useCallback((slug: string) => mutate("product.delete", { slug }), [mutate]);
  const unsubscribe = useCallback((id: string) => mutate("subscriber.remove", { id }), [mutate]);
  const saveFinanceEntry = useCallback((entry: FinanceEntry) => mutate("finance.save", { entry }), [mutate]);
  const deleteFinanceEntry = useCallback((id: string) => mutate("finance.delete", { id }), [mutate]);

  const subscribe = useCallback(async (email: string, consent: boolean) => {
    if (!backendConfigured) {
      return { ok: false, message: "Newsletter signup is not configured yet." };
    }
    try {
      const response = await fetch("/api/public/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent })
      });
      const result = await response.json() as { message?: string; error?: string };
      return { ok: response.ok, message: result.message ?? result.error ?? "Newsletter signup could not be completed." };
    } catch (error) {
      console.error("Colgar newsletter signup could not reach the backend.", error);
      return { ok: false, message: "The newsletter service could not be reached. Please try again." };
    }
  }, [backendConfigured]);

  const signOut = useCallback(async () => {
    window.location.assign("/cdn-cgi/access/logout");
  }, []);

  const value = useMemo(() => ({
    ...state,
    ready,
    role,
    backendConfigured,
    financeMfaRequired,
    backendError,
    saveBlog,
    setBlogStatus,
    deleteBlog,
    saveProduct,
    setProductVisibility,
    deleteProduct,
    subscribe,
    unsubscribe,
    saveFinanceEntry,
    deleteFinanceEntry,
    signOut,
    reload
  }), [
    state, ready, role, backendConfigured, financeMfaRequired, backendError, saveBlog,
    setBlogStatus, deleteBlog, saveProduct, setProductVisibility, deleteProduct,
    subscribe, unsubscribe, saveFinanceEntry, deleteFinanceEntry, signOut, reload
  ]);

  return <AdminContentContext.Provider value={value}>{children}</AdminContentContext.Provider>;
}

export function useAdminContent() {
  const context = useContext(AdminContentContext);
  if (!context) throw new Error("useAdminContent must be used within an AdminContentProvider.");
  return context;
}
