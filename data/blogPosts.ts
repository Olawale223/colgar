export type BlogStatus = "published" | "draft" | "hidden";

export type BlogPost = {
  id: string;
  href: string;
  image: string;
  alt: string;
  meta: string;
  title: string;
  description: string;
  content: string;
  status: BlogStatus;
  includeInNewsletter: boolean;
};

export const initialBlogPosts: BlogPost[] = [
  {
    id: "students-pads-outreach",
    href: "/blog/students-pads-outreach",
    image: "https://www.colgar.org/wp-content/uploads/2025/06/COLGA-82-420x300.jpg",
    alt: "Students taking part in a Ladies Care outreach",
    meta: "Donation · 29 June 2025",
    title: "800 students, 1 public school, enough pads to go round.",
    description: "A Ladies Care outreach in Abuja brought menstrual care and support to students at one public school.",
    content: "A Ladies Care outreach in Abuja brought menstrual care and support to students at one public school.",
    status: "published",
    includeInNewsletter: false
  },
  {
    id: "offa-clothing-drive",
    href: "/blog/offa-clothing-drive",
    image: "https://www.colgar.org/wp-content/uploads/2025/02/COLGAR-Cover-Cloth-Bank222222-420x300.jpg",
    alt: "Cloth Bank drive in Offa, Kwara State",
    meta: "Cloth Bank · Outreach · 22 February 2025",
    title: "Charity clothing drive outreach in Offa, Kwara State",
    description: "A look at Colgar’s clothing drive and the community members it reached in Offa.",
    content: "A look at Colgar’s clothing drive and the community members it reached in Offa.",
    status: "published",
    includeInNewsletter: false
  },
  {
    id: "partial-school-fees",
    href: "/blog/partial-school-fees",
    image: "https://www.colgar.org/wp-content/uploads/2025/02/col-420x300.jpg",
    alt: "Students supported through a school fees outreach",
    meta: "Outreach · 8 February 2025",
    title: "Partial School Fees Outreach",
    description: "Stories of practical support for students and families working to keep education within reach.",
    content: "Stories of practical support for students and families working to keep education within reach.",
    status: "published",
    includeInNewsletter: false
  },
  {
    id: "our-journey-by-kello",
    href: "/blog/our-journey-by-kello",
    image: "https://www.colgar.org/wp-content/uploads/2024/12/IMG_1729_2-420x300.jpg",
    alt: "A visual story from the Colgar community",
    meta: "Youth · 14 December 2024",
    title: "Our Journey by Kello",
    description: "A pictorial journey through Colgar and the people who make the work what it is.",
    content: "A pictorial journey through Colgar and the people who make the work what it is.",
    status: "published",
    includeInNewsletter: false
  },
  {
    id: "fighting-period-poverty",
    href: "/blog/fighting-period-poverty",
    image: "https://www.colgar.org/wp-content/uploads/2024/09/COLGAR-Cover-Ladies-Care-24-1-420x300.jpg",
    alt: "Colgar Ladies Care period poverty campaign",
    meta: "Ladies Care · 16 September 2024",
    title: "Fighting Period Poverty",
    description: "Why access to menstrual products and open conversations matter for students in Nigeria.",
    content: "Why access to menstrual products and open conversations matter for students in Nigeria.",
    status: "published",
    includeInNewsletter: false
  },
  {
    id: "cloth-banks-rural-communities",
    href: "/blog/cloth-banks-rural-communities",
    image: "https://www.colgar.org/wp-content/uploads/2024/07/Mukkycloth-scaled-new-420x300.jpg",
    alt: "Clothing from the Colgar Cloth Bank",
    meta: "Donation · 30 July 2023",
    title: "Empowering rural communities through Cloth Banks",
    description: "How a community cloth bank can help respond to clothing needs and restore dignity.",
    content: "How a community cloth bank can help respond to clothing needs and restore dignity.",
    status: "published",
    includeInNewsletter: false
  }
];
