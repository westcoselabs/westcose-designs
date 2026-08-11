export type SketchbookAsset = {
  id: `sketchbook-${"01" | "02" | "03" | "04"}`;
  order: 1 | 2 | 3 | 4;
  src: `/experience/sketchbook/${string}.webp`;
  sourceFile: `Portfolio/${string}`;
  width: number;
  height: number;
  title: string;
  category: string;
  alt: string;
  layout: "cutout" | "poster" | "study";
  pageSide: "left" | "right";
  accent: `#${string}`;
  annotation?: "KEEP CREATING." | "KEEP PUSHING.";
};

export const SKETCHBOOK_ASSETS = [
  {
    id: "sketchbook-01",
    order: 1,
    src: "/experience/sketchbook/impala-green.webp",
    sourceFile: "Portfolio/Green Impala-01.webp",
    width: 1350,
    height: 1080,
    title: "Green Impala",
    category: "Automotive illustration",
    alt: "Mint-green lowrider Impala lifting its front wheels, rendered with black ink lines, chrome details, and gold halftone accents.",
    layout: "cutout",
    pageSide: "right",
    accent: "#CBD9B7",
    annotation: "KEEP CREATING.",
  },
  {
    id: "sketchbook-02",
    order: 2,
    src: "/experience/sketchbook/impala-red.webp",
    sourceFile: "Portfolio/Red Impala-01.webp",
    width: 1350,
    height: 1080,
    title: "Red Impala",
    category: "Color variant",
    alt: "Red lowrider Impala rising toward the viewer with yellow headlights, chrome bumpers, and dense halftone shading.",
    layout: "cutout",
    pageSide: "left",
    accent: "#D92F2F",
    annotation: undefined,
  },
  {
    id: "sketchbook-03",
    order: 3,
    src: "/experience/sketchbook/magic-shoes.webp",
    sourceFile: "Portfolio/Magic Shoes-01.jpg",
    width: 1600,
    height: 2000,
    title: "Magic Shoes",
    category: "Apparel illustration",
    alt: "Teal high-top shoes surrounded by red mushrooms and leaves beneath hand-lettered Magic Shoes typography.",
    layout: "poster",
    pageSide: "right",
    accent: "#E44F2F",
    annotation: "KEEP PUSHING.",
  },
  {
    id: "sketchbook-04",
    order: 4,
    src: "/experience/sketchbook/hillbilly-studies.webp",
    sourceFile: "Portfolio/Hillbilly-01.webp",
    width: 1920,
    height: 1080,
    title: "Hillbilly Studies",
    category: "Identity illustration study",
    alt: "A broad study sheet of Hillbilly Flannel Company badges, mascots, wordmarks, and lockup variations in black, white, blue, and earth tones.",
    layout: "study",
    pageSide: "left",
    accent: "#2E7BBE",
    annotation: undefined,
  },
] as const satisfies readonly SketchbookAsset[];
