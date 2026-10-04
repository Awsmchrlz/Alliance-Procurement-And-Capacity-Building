import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  type?: string;
  image?: string;
  url?: string;
}

export function SEO({
  title,
  description = "Join Alliance Procurement & Capacity Building for professional development events, training programs, and networking opportunities. Enhance your procurement skills and build capacity in your organization.",
  keywords = "procurement, capacity building, professional development, training, events, alliance, networking, skills development",
  type = "website",
  image = "/favicon.svg",
  url = "https://alliance-procurement.com",
}: SEOProps) {
  // Ensure title always has a consistent suffix
  const formattedTitle = title.includes("| Alliance") 
    ? title 
    : `${title} | Alliance Procurement & Capacity Building`;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{formattedTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Alliance Procurement & Capacity Building" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
