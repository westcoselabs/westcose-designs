export const siteConfig = {
  name: "WestCose Designs",
  description:
    "An independent design studio creating brand identities, illustration, apparel graphics, and visual systems.",
  url: "https://westcosedesigns.com",
} as const;

export function absoluteUrl(pathname = "/") {
  return new URL(pathname, siteConfig.url).toString();
}
