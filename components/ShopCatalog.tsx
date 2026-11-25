"use client";

import { useMemo, useState } from "react";
import { useAdminContent } from "@/components/AdminContentProvider";
import { ProductCard } from "@/components/ProductCard";
import { productCategories, type ProductCategory } from "@/data/products";
import styles from "./ShopCatalog.module.css";

const PAGE_SIZE = 6;

export function ShopCatalog() {
  const { products } = useAdminContent();
  const [category, setCategory] = useState<ProductCategory | "all">("all");
  const [page, setPage] = useState(0);

  const filteredProducts = useMemo(
    () => {
      const visibleProducts = products.filter((product) => product.visible);
      return category === "all"
        ? visibleProducts
        : visibleProducts.filter((product) => product.category === category);
    },
    [category, products]
  );
  const pageCount = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const visibleProducts = filteredProducts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const rangeStart = filteredProducts.length === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd = Math.min((page + 1) * PAGE_SIZE, filteredProducts.length);

  function chooseCategory(nextCategory: ProductCategory | "all") {
    setCategory(nextCategory);
    setPage(0);
  }

  return (
    <>
      <div className={styles.catalogControls}>
        <div className={styles.filters} role="group" aria-label="Filter products by type">
          {productCategories.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`${styles.filter}${category === item.value ? ` ${styles.activeFilter}` : ""}`}
              aria-pressed={category === item.value}
              onClick={() => chooseCategory(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className={styles.resultCount} aria-live="polite">
          Showing {rangeStart}–{rangeEnd} of {filteredProducts.length} items
        </p>
      </div>

      <div className={styles.grid}>
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.slug}
            href={`/product/${product.slug}`}
            image={product.image}
            alt={product.alt}
            title={product.title}
            price={product.priceLabel}
            option={Boolean(product.options)}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <p className={styles.empty}>There are no items in this collection right now.</p>
      )}

      {filteredProducts.length > PAGE_SIZE && (
        <nav className={styles.pagination} aria-label="Shop pages">
          <button
            type="button"
            className={styles.pageButton}
            disabled={page === 0}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
          >
            Previous
          </button>
          <span className={styles.pageStatus} aria-live="polite">
            Page {page + 1} of {pageCount}
          </span>
          <button
            type="button"
            className={styles.pageButton}
            disabled={page >= pageCount - 1}
            onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
          >
            Next <span aria-hidden="true">→</span>
          </button>
        </nav>
      )}
    </>
  );
}
