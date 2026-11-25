export type ProductCategory =
  | "shirts"
  | "caps"
  | "tote-bags"
  | "sticker-packs"
  | "movie-tickets";

export type ProductOption = {
  label: string;
  price: number;
  impact?: string;
};

export type Product = {
  slug: string;
  title: string;
  price: number;
  priceLabel: string;
  image: string;
  alt: string;
  category: ProductCategory;
  description: string;
  details: string[];
  options?: ProductOption[];
};

const shirtSizes: ProductOption[] = [
  { label: "Small", price: 15000 },
  { label: "Medium", price: 15000 },
  { label: "Large", price: 15000 },
  { label: "X-Large", price: 15000 },
  { label: "XX-Large", price: 15000 }
];

const toteSizes: ProductOption[] = [
  { label: "Small", price: 5000 },
  { label: "Large", price: 7000 }
];

const socialConstructionTickets: ProductOption[] = [
  { label: "Starter Pass", price: 4000, impact: "Sends one child to school." },
  { label: "Supporter Pass", price: 6000, impact: "Supports a child with books, a biro, and socks." },
  { label: "Change Maker Pass", price: 10000, impact: "Supports a child with books, a biro, socks, and a school bag." },
  { label: "Impact Hero Pass", price: 15000, impact: "Sends two children to school with books, a biro, and socks." },
  { label: "Hope Builder Pass", price: 20000, impact: "Supports two children with books, a biro, socks, and bags." },
  { label: "Dream Giver Pass", price: 30000, impact: "Supports three children with learning essentials." },
  { label: "Community Lifter Pass", price: 50000, impact: "Supports five children with learning essentials." },
  { label: "Future Shaper Pass", price: 75000, impact: "Supports seven children with learning essentials." },
  { label: "Legacy Partner Pass", price: 100000, impact: "Supports ten children with learning essentials." }
];

export const productCategories: { value: ProductCategory | "all"; label: string }[] = [
  { value: "all", label: "All items" },
  { value: "shirts", label: "Shirts" },
  { value: "caps", label: "Caps" },
  { value: "tote-bags", label: "Tote bags" },
  { value: "sticker-packs", label: "Sticker packs" },
  { value: "movie-tickets", label: "Movie tickets" }
];

export const products: Product[] = [
  {
    title: "Colgar Crew Merch",
    slug: "colgar-crew-merch",
    price: 15000,
    priceLabel: "₦15,000",
    image: "https://www.colgar.org/wp-content/uploads/2025/06/PHOTO-2025-04-06-20-56-48-1-300x300.jpg",
    alt: "Colgar Crew Merch",
    category: "shirts",
    description: "Colgar crew wear for the community that shows up together.",
    details: ["T-shirt", "Available in sizes Small to XX-Large"],
    options: shirtSizes
  },
  {
    title: "Colgar SDG Merch",
    slug: "colgar-sdg-merch",
    price: 15000,
    priceLabel: "₦15,000",
    image: "https://www.colgar.org/wp-content/uploads/2023/09/PHOTO-2022-11-01-14-12-11-300x300.jpg",
    alt: "Colgar SDG merchandise",
    category: "shirts",
    description: "Colgar SDG T-shirt from the crew-wear collection.",
    details: ["T-shirt", "Available in sizes Small to XX-Large"],
    options: shirtSizes
  },
  {
    title: "Colgar Studio Merch",
    slug: "colgar-studio-merch",
    price: 20000,
    priceLabel: "₦20,000",
    image: "https://www.colgar.org/wp-content/uploads/2025/06/PHOTO-2025-04-06-20-56-48-e1751076133716-300x300.jpg",
    alt: "Colgar Studio Merch",
    category: "shirts",
    description: "A Colgar Studio T-shirt for everyday wear.",
    details: ["T-shirt", "Available in sizes Small to XX-Large"],
    options: shirtSizes.map((option) => ({ ...option, price: 20000 }))
  },
  {
    title: "FPPT Tote Bag",
    slug: "fppt-tote-bag",
    price: 5000,
    priceLabel: "₦5,000 – ₦7,000",
    image: "https://www.colgar.org/wp-content/uploads/2025/06/COLGAR-Tote-1-1-300x300.jpg",
    alt: "FPPT tote bag",
    category: "tote-bags",
    description: "A reusable tote carrying a message of support for menstrual health and dignity.",
    details: ["Available in Small and Large", "Proceeds support menstrual hygiene programs"],
    options: toteSizes
  },
  {
    title: "Ladies Care Tote Bag",
    slug: "ladies-care-tote",
    price: 5000,
    priceLabel: "₦5,000 – ₦7,000",
    image: "https://www.colgar.org/wp-content/uploads/2025/06/COLGAR-Tote-4-1-300x300.jpg",
    alt: "Ladies Care tote bag",
    category: "tote-bags",
    description: "An everyday tote that supports access to menstrual hygiene products for girls in underserved communities.",
    details: ["Available in Small and Large", "Proceeds support Ladies Care"],
    options: toteSizes
  },
  {
    title: "Ladies Sticker Pack",
    slug: "ladies-sticker-pack",
    price: 5000,
    priceLabel: "₦5,000",
    image: "https://www.colgar.org/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-09-at-15.33.39-300x300.jpeg",
    alt: "Colgar Ladies Care sticker pack",
    category: "sticker-packs",
    description: "A small Colgar Ladies Care keepsake from the community shop.",
    details: ["Ladies Care collection"]
  },
  {
    title: "Late, But Worth It",
    slug: "latebut-worth-it",
    price: 15000,
    priceLabel: "₦15,000",
    image: "https://www.colgar.org/wp-content/uploads/2026/05/3-300x300.png",
    alt: "Late, But Worth It cap",
    category: "caps",
    description: "A cap from the Colgar Ladies Care collection.",
    details: ["Ladies Care collection"]
  },
  {
    title: "Moody Girl Club Cap",
    slug: "moody-girl-club-cap",
    price: 15000,
    priceLabel: "₦15,000",
    image: "https://www.colgar.org/wp-content/uploads/2026/05/2-300x300.png",
    alt: "Moody Girl Club cap",
    category: "caps",
    description: "A cap from the Colgar Ladies Care collection.",
    details: ["Ladies Care collection"]
  },
  {
    title: "Outreach Memories Long Sleeve",
    slug: "outreach-memories-long-sleeve",
    price: 30000,
    priceLabel: "₦30,000",
    image: "https://www.colgar.org/wp-content/uploads/2025/11/IMG_5256.png",
    alt: "Outreach Memories long sleeve",
    category: "shirts",
    description: "A long-sleeve T-shirt from Colgar's Outreach Memories collection.",
    details: ["Long-sleeve T-shirt", "Select a size"],
    options: shirtSizes.map((option) => ({ ...option, price: 30000 }))
  },
  {
    title: "Outreach Memories Short Sleeve",
    slug: "outreach-memories-short-sleeve",
    price: 30000,
    priceLabel: "₦30,000",
    image: "https://www.colgar.org/wp-content/uploads/2025/11/img_5255.png",
    alt: "Outreach Memories short sleeve",
    category: "shirts",
    description: "A short-sleeve T-shirt from Colgar's Outreach Memories collection.",
    details: ["Short-sleeve T-shirt", "Select a size"],
    options: shirtSizes.map((option) => ({ ...option, price: 30000 }))
  },
  {
    title: "Save The Street Tote Bag",
    slug: "save-the-street-tote",
    price: 5000,
    priceLabel: "₦5,000 – ₦7,000",
    image: "https://www.colgar.org/wp-content/uploads/2025/06/COLGAR-Tote-3-2-300x300.jpg",
    alt: "Save The Street tote bag",
    category: "tote-bags",
    description: "A reusable tote that supports street outreach and youth empowerment projects.",
    details: ["Available in Small and Large", "Proceeds support outreach programs"],
    options: toteSizes
  },
  {
    title: "Save The Streets T-Shirt",
    slug: "save-the-streets-t-shirt",
    price: 40000,
    priceLabel: "₦40,000",
    image: "https://www.colgar.org/wp-content/uploads/2024/04/RB-Tee-Black-Front-300x300.jpg",
    alt: "Save The Streets T-shirt",
    category: "shirts",
    description: "A black cotton T-shirt created with creative partners to support Colgar's Sallah Clothes for Everyone initiative.",
    details: ["Unisex design", "Available in sizes Small to XX-Large"],
    options: shirtSizes.map((option) => ({ ...option, price: 40000 }))
  },
  {
    title: "Save The Streets T-Shirt Long Sleeve",
    slug: "save-the-streets-t-shirt-sleeve",
    price: 40000,
    priceLabel: "₦40,000",
    image: "https://www.colgar.org/wp-content/uploads/2025/03/save_the_street_sleeve_front-300x300.jpg",
    alt: "Save The Streets long sleeve T-shirt",
    category: "shirts",
    description: "A long-sleeve T-shirt from the Save The Streets collection, supporting Colgar's Sallah Clothes for Everyone initiative.",
    details: ["Available in sizes Small to XX-Large"],
    options: shirtSizes.map((option) => ({ ...option, price: 40000 }))
  },
  {
    title: "Social Construction 102",
    slug: "social-construction",
    price: 4000,
    priceLabel: "₦4,000 – ₦100,000",
    image: "https://www.colgar.org/wp-content/uploads/2025/07/IMG_3354-300x300.jpg",
    alt: "Social Construction 102 movie night",
    category: "movie-tickets",
    description: "One night. One ticket. A lifetime of change. Join Colgar at Garden 66 in Ilorin for a movie night supporting children's education.",
    details: [
      "Venue: Garden 66, Ilorin, Kwara State",
      "Ticket proceeds support school fees, books, and learning materials"
    ],
    options: socialConstructionTickets
  },
  {
    title: "Street Rules Long Sleeve",
    slug: "street-rules-long-sleeve",
    price: 30000,
    priceLabel: "₦30,000",
    image: "https://www.colgar.org/wp-content/uploads/2025/11/LS-Tee-1.png",
    alt: "Street Rules long sleeve",
    category: "shirts",
    description: "A long-sleeve T-shirt from the Social Construction collection.",
    details: ["Long-sleeve T-shirt", "Select a size"],
    options: shirtSizes.map((option) => ({ ...option, price: 30000 }))
  },
  {
    title: "Street Rules Short Sleeve",
    slug: "street-rules-short-sleeve",
    price: 30000,
    priceLabel: "₦30,000",
    image: "https://www.colgar.org/wp-content/uploads/2025/11/img_5249-2.png",
    alt: "Street Rules short sleeve",
    category: "shirts",
    description: "A short-sleeve T-shirt from the Social Construction collection.",
    details: ["Short-sleeve T-shirt", "Select a size"],
    options: shirtSizes.map((option) => ({ ...option, price: 30000 }))
  }
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}
