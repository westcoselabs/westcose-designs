import type { MetadataRoute } from "next";

import { absoluteUrl, siteConfig } from "@/lib/seo/site";

function isIndexableEnvironment() {
  if (process.env.VERCEL_ENV) {
    return process.env.VERCEL_ENV === "production";
  }

  return process.env.NODE_ENV === "production";
}

export default function robots(): MetadataRoute.Robots {
  const indexable = isIndexableEnvironment();

  return {
    rules: {
      userAgent: "*",
      ...(indexable ? { allow: "/" } : { disallow: "/" }),
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.url,
  };
}
