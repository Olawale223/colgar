import type { Metadata } from "next";
import { ProductDetail } from "./ProductDetail";
import { SiteFooter } from "@/components/SiteFooter";
import { getProduct, productCategories, products } from "@/data/products";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {
    title: "Colgar Shop — Community merchandise",
    description: "Explore Colgar merchandise and support youth-led community programs in Nigeria."
  };
  return {
    title: `${product.title} — Colgar Shop`,
    description: product.description
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  return (
    <>
      <ProductDetail slug={slug} />
      <SiteFooter page="shop" />
    </>
  );
}
