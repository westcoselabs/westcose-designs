export type IllustrationAsset = {
  id: `illustration-${"01" | "02" | "03" | "04"}`;
  order: 1 | 2 | 3 | 4;
  src: `/experience/illustrations/${string}.webp`;
  width: number;
  height: number;
  title: string;
  category: string;
  alt: string;
  accent: `#${string}`;
  palette: readonly [
    `#${string}`,
    `#${string}`,
    `#${string}`,
    `#${string}`,
  ];
};

export const ILLUSTRATION_ASSETS = [
  {
    id: "illustration-01",
    order: 1,
    src: "/experience/illustrations/illustration-01.webp",
    width: 1599,
    height: 2000,
    title: "60s Chevy",
    category: "Automotive illustration",
    alt: "Illustrated olive-green 1960s Chevrolet pickup with a supercharged engine beneath oversized WestCose Design Co. lettering.",
    accent: "#6C6C54",
    palette: ["#101010", "#E4CCB4", "#6C6C54", "#84543C"],
  },
  {
    id: "illustration-02",
    order: 2,
    src: "/experience/illustrations/illustration-02.webp",
    width: 1080,
    height: 1350,
    title: "Fire Water",
    category: "Apparel illustration",
    alt: "Skeleton rider on a motorcycle surrounded by orange flames and deep blue water.",
    accent: "#E49C0C",
    palette: ["#101010", "#E49C0C", "#CC3C0C", "#0C5484"],
  },
  {
    id: "illustration-03",
    order: 3,
    src: "/experience/illustrations/illustration-03.webp",
    width: 1600,
    height: 2000,
    title: "Low Tide High Risk",
    category: "Brand illustration",
    alt: "WestCose coastal collage with a tattooed woman in sunglasses, motel sign, breaking wave, palms, and orange sunset.",
    accent: "#FC843C",
    palette: ["#101010", "#FC843C", "#FCE4B4", "#0C7474"],
  },
  {
    id: "illustration-04",
    order: 4,
    src: "/experience/illustrations/illustration-04.webp",
    width: 1080,
    height: 1350,
    title: "Sunshine Shadows",
    category: "Apparel illustration",
    alt: "Golden skull surrounded by sunflowers and smaller skulls beneath Sunshine Shadows lettering.",
    accent: "#FCCC54",
    palette: ["#101010", "#FCFCB4", "#FCCC54", "#6C7454"],
  },
] as const satisfies readonly IllustrationAsset[];
