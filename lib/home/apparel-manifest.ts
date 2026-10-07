// Scene 04 apparel mixer. Mockups are 1080×1080 transparent WebP exports of
// the Summer 2026 line; add a design by dropping a matching file in
// /public/experience/apparel and appending an entry below.

export type ApparelFront = {
  id: string;
  title: string;
  src: `/experience/apparel/${string}.webp`;
  alt: string;
  placement: string;
  method: "Screen" | "DTF";
  /** Chest print center as a percentage of the mockup image. */
  print: { x: number; y: number };
};

export type ApparelBack = {
  id: string;
  title: string;
  src: `/experience/apparel/${string}.webp`;
  alt: string;
  placement: string;
  method: "Screen" | "DTF";
};

export const APPAREL_FRONTS: readonly ApparelFront[] = [
  {
    id: "front-westcose-or-nothing",
    title: "WestCose or Nothing",
    src: "/experience/apparel/front-westcose-or-nothing.webp",
    alt: "Black tee, front, with a small cream WestCose or Nothing crest on the left chest.",
    placement: "Left chest · 3.5 in",
    method: "Screen",
    print: { x: 61.3, y: 28.1 },
  },
  {
    id: "front-westcose-designs",
    title: "WestCose Designs",
    src: "/experience/apparel/front-westcose-designs.webp",
    alt: "Black tee, front, with a small cream WestCose Designs sign badge on the left chest.",
    placement: "Left chest · 3.5 in",
    method: "Screen",
    print: { x: 62.3, y: 28.2 },
  },
  {
    id: "front-westcose-motel",
    title: "Motel chest hit",
    src: "/experience/apparel/front-westcose-motel.webp",
    alt: "Black tee, front, with a small full-color WestCose motel and wave badge on the left chest.",
    placement: "Left chest · 3.5 in",
    method: "DTF",
    print: { x: 62.6, y: 27.7 },
  },
];

export const APPAREL_BACKS: readonly ApparelBack[] = [
  {
    id: "back-westcose-or-nothing",
    title: "WestCose or Nothing",
    src: "/experience/apparel/back-westcose-or-nothing.webp",
    alt: "Black tee, back, with a large cream blackletter WestCose or Nothing graphic and skull wave.",
    placement: "Full back · 12 in",
    method: "Screen",
  },
  {
    id: "back-westcose-designs",
    title: "WestCose Designs sign",
    src: "/experience/apparel/back-westcose-designs.webp",
    alt: "Black tee, back, with a large cream roadside sign graphic reading WestCose Designs, open 24 hours.",
    placement: "Full back · 12 in",
    method: "Screen",
  },
  {
    id: "back-low-tide-high-risk",
    title: "Low Tide High Risk",
    src: "/experience/apparel/back-low-tide-high-risk.webp",
    alt: "Black tee, back, with a full-color illustration of a tattooed woman in sunglasses beneath a WestCose headline.",
    placement: "Full back · 12 in",
    method: "DTF",
  },
];

export const APPAREL_KIT = [
  { id: "vector", title: "Vector artwork", icon: "pen", formats: ["AI", "SVG", "PDF"] },
  { id: "print", title: "Print files", icon: "stack", formats: ["Seps", "PNG 300", "DTF"] },
  { id: "mockups", title: "Mockups", icon: "shirt", formats: ["Front", "Back", "Colorways"] },
  { id: "colorways", title: "Colorways", icon: "palette", formats: ["Dark", "Light", "Alt ink"] },
  { id: "launch", title: "Launch graphics", icon: "megaphone", formats: ["Social", "Web", "Store"] },
  { id: "specs", title: "Production specs", icon: "ruler", formats: ["Placement", "Sizes", "Inks"] },
] as const;

export const APPAREL_EXPERTISE = [
  { title: "Illustration", detail: "Drawn in-house, never stock" },
  { title: "Lettering & type", detail: "Wordmarks with attitude" },
  { title: "Print prep", detail: "Screen seps and DTF files" },
  { title: "Sourcing", detail: "Blanks for every budget" },
] as const;
