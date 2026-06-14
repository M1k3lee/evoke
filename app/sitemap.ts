import type { MetadataRoute } from "next";

// strip any trailing slash so we don't end up with double slashes when
// we concatenate. yes i did this the dumb way the first time. yes the
// double slash made it onto the live sitemap. moving on.
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://evoke.ai").replace(/\/+$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`,        lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE_URL}/forge`,   lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/chamber`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/support`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    // /auth deliberately excluded — robots.index=false on that route
  ];
}
