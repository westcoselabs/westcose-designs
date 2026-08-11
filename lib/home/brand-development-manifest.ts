export type BrandDevelopmentBeatId =
  | "mark"
  | "typography"
  | "color"
  | "architecture"
  | "application"
  | "complete-system";

export type BrandDevelopmentBeat = {
  readonly id: BrandDevelopmentBeatId;
  readonly order: 1 | 2 | 3 | 4 | 5 | 6;
  readonly label: string;
  readonly title: string;
  readonly project: string;
  readonly detail: string;
  readonly src: `/experience/brand-development/${string}.webp`;
  readonly sourceFile: `Portfolio/${string}`;
  readonly width: 1600;
  readonly height: 900;
  readonly alt: string;
  readonly accent: `#${string}`;
  readonly progress: readonly [start: number, end: number];
};

export const BRAND_DEVELOPMENT_BEATS = [
  {
    id: "mark",
    order: 1,
    label: "Mark",
    title: "The mark sets the signal.",
    project: "Vested Clothing Co.",
    detail: "Primary marks and lockups establish the recognizable core.",
    src: "/experience/brand-development/vested-lockups.webp",
    sourceFile: "Portfolio/Logo Design/Logo Design-06.png",
    width: 1600,
    height: 900,
    alt: "Vested Clothing Company mark and lockup explorations in red, black, and gray.",
    accent: "#e18453",
    progress: [0, 0.22],
  },
  {
    id: "typography",
    order: 2,
    label: "Typography",
    title: "Type gives the system its voice.",
    project: "Performance Diesel Co.",
    detail: "A distinct typographic hierarchy keeps every lockup related.",
    src: "/experience/brand-development/performance-type-system.webp",
    sourceFile: "Portfolio/Logo Design/Logo Design-07.png",
    width: 1600,
    height: 900,
    alt: "Performance Diesel Company typographic logo family in red, white, and black.",
    accent: "#e18453",
    progress: [0.14, 0.38],
  },
  {
    id: "color",
    order: 3,
    label: "Color",
    title: "Color makes recognition repeatable.",
    project: "Full Cycle Glass Gallery",
    detail: "Controlled colorways create range without losing the identity.",
    src: "/experience/brand-development/full-cycle-colorways.webp",
    sourceFile: "Portfolio/Logo Design/Logo Design-11.png",
    width: 1600,
    height: 900,
    alt: "Full Cycle Glass Gallery wordmarks shown across green, orange, purple, and blue colorways.",
    accent: "#e18453",
    progress: [0.3, 0.54],
  },
  {
    id: "architecture",
    order: 4,
    label: "Architecture",
    title: "One identity. Multiple expressions.",
    project: "Hillbilly Flannel Co.",
    detail: "Badges, mascots, and lockups scale from one shared visual language.",
    src: "/experience/brand-development/hillbilly-architecture.webp",
    sourceFile: "Portfolio/Hillbilly-01.webp",
    width: 1600,
    height: 900,
    alt: "Hillbilly Flannel Company identity family with badges, mascots, and lockups.",
    accent: "#e18453",
    progress: [0.46, 0.7],
  },
  {
    id: "application",
    order: 5,
    label: "Application",
    title: "Built for the places people meet it.",
    project: "Eighty Six'd",
    detail: "The identity carries through alternates, apparel, and production use.",
    src: "/experience/brand-development/eightysixd-applications.webp",
    sourceFile: "Portfolio/Logo Design/Logo Design-03.png",
    width: 1600,
    height: 900,
    alt: "Eighty Six'd identity exploration with marks, lockups, and hat applications.",
    accent: "#e18453",
    progress: [0.62, 0.86],
  },
  {
    id: "complete-system",
    order: 6,
    label: "Complete system",
    title: "Built to work everywhere.",
    project: "19th Hole Bar & Grill",
    detail: "A flexible family resolves into one confident, production-ready system.",
    src: "/experience/brand-development/nineteenth-hole-system.webp",
    sourceFile: "Portfolio/Logo Design/Logo Design-10.png",
    width: 1600,
    height: 900,
    alt: "19th Hole Bar and Grill logo family with multiple lockup configurations.",
    accent: "#e18453",
    progress: [0.78, 1],
  },
] as const satisfies readonly BrandDevelopmentBeat[];
