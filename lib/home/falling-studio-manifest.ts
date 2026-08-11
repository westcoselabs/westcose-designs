export type FallingStudioCategoryId =
  | "identity"
  | "illustration"
  | "apparel"
  | "brand-systems";

export type FallingStudioDepth = "midground" | "foreground";

type FallingStudioPoint = readonly [x: number, y: number];

export type FallingStudioArtwork = {
  readonly id: string;
  readonly category: FallingStudioCategoryId;
  readonly title: string;
  readonly src: `/experience/${string}.webp`;
  readonly sourceFile: `Portfolio/${string}`;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly depth: FallingStudioDepth;
  readonly progress: readonly [start: number, end: number];
  readonly path: readonly [
    start: FallingStudioPoint,
    control: FallingStudioPoint,
    end: FallingStudioPoint,
  ];
  readonly rotation: readonly [start: number, end: number];
  readonly tilt: readonly [x: number, y: number];
  readonly scale: readonly [start: number, end: number];
};

export const FALLING_STUDIO_MEDIA = {
  video: "/experience/falling-studio/falling-placeholder.mp4",
  poster: "/experience/falling-studio/falling-placeholder-poster.webp",
  stills: [
    {
      src: "/experience/falling-studio/falling-placeholder-still-00.webp",
      alt: "Falling Studio sequence, opening composition.",
      label: "Entry",
    },
    {
      src: "/experience/falling-studio/falling-placeholder-still-50.webp",
      alt: "Falling Studio sequence, midpoint composition.",
      label: "Descent",
    },
    {
      src: "/experience/falling-studio/falling-placeholder-still-100.webp",
      alt: "Falling Studio sequence, closing composition.",
      label: "Handoff",
    },
  ],
} as const;

export const FALLING_STUDIO_CATEGORIES = [
  { id: "identity", label: "Identity" },
  { id: "illustration", label: "Illustration" },
  { id: "apparel", label: "Apparel" },
  { id: "brand-systems", label: "Brand systems" },
] as const satisfies readonly {
  id: FallingStudioCategoryId;
  label: string;
}[];

export const FALLING_STUDIO_ARTWORK = [
  {
    id: "identity-hillbilly",
    category: "identity",
    title: "Hillbilly identity family",
    src: "/experience/falling-studio/artwork/identity-hillbilly.webp",
    sourceFile: "Portfolio/Hillbilly-01.webp",
    width: 1200,
    height: 675,
    alt: "Hillbilly Flannel Company identity family with badges, mascots, and lockups.",
    depth: "midground",
    progress: [0.03, 0.31],
    path: [
      [0.82, -0.24],
      [0.62, 0.42],
      [0.2, 1.24],
    ],
    rotation: [-8, 9],
    tilt: [9, -7],
    scale: [0.62, 0.94],
  },
  {
    id: "identity-vested",
    category: "identity",
    title: "Vested lockup study",
    src: "/experience/falling-studio/artwork/identity-vested.webp",
    sourceFile: "Portfolio/Logo Design/Logo Design-06.png",
    width: 1200,
    height: 675,
    alt: "Vested Clothing Company mark and lockup explorations in red, black, and gray.",
    depth: "foreground",
    progress: [0.1, 0.37],
    path: [
      [0.14, -0.22],
      [0.31, 0.34],
      [0.72, 1.3],
    ],
    rotation: [7, -11],
    tilt: [-8, 8],
    scale: [0.7, 1.08],
  },
  {
    id: "illustration-crows",
    category: "illustration",
    title: "Crows",
    src: "/experience/falling-studio/artwork/illustration-crows.webp",
    sourceFile: "Portfolio/Crows-01.webp",
    width: 864,
    height: 1080,
    alt: "WestCose desert illustration with a crow, skulls, cactus, and a yellow sun.",
    depth: "midground",
    progress: [0.24, 0.52],
    path: [
      [0.78, -0.28],
      [0.55, 0.43],
      [0.22, 1.3],
    ],
    rotation: [9, -8],
    tilt: [7, -9],
    scale: [0.64, 0.92],
  },
  {
    id: "illustration-underwater",
    category: "illustration",
    title: "Underwater Cose",
    src: "/experience/falling-studio/artwork/illustration-underwater.webp",
    sourceFile: "Portfolio/Underwater Cose-01.webp",
    width: 864,
    height: 1080,
    alt: "Underwater WestCose illustration with a skull, coral, sea plants, and fish.",
    depth: "foreground",
    progress: [0.31, 0.59],
    path: [
      [0.2, -0.27],
      [0.43, 0.42],
      [0.82, 1.28],
    ],
    rotation: [-10, 8],
    tilt: [-10, 9],
    scale: [0.72, 1.16],
  },
  {
    id: "apparel-westcose-or-nothing",
    category: "apparel",
    title: "WestCose or Nothing",
    src: "/experience/falling-studio/artwork/apparel-westcose-or-nothing.webp",
    sourceFile: "Portfolio/WestCose or Nothing.jpg",
    width: 864,
    height: 1080,
    alt: "Cream WestCose or Nothing apparel graphic with a skull emerging from a wave.",
    depth: "midground",
    progress: [0.47, 0.75],
    path: [
      [0.7, -0.3],
      [0.47, 0.36],
      [0.16, 1.28],
    ],
    rotation: [7, -12],
    tilt: [8, -6],
    scale: [0.64, 1.02],
  },
  {
    id: "apparel-usps",
    category: "apparel",
    title: "Postal Service character",
    src: "/experience/falling-studio/artwork/apparel-usps.webp",
    sourceFile: "Portfolio/USPS 2-03.webp",
    width: 864,
    height: 1080,
    alt: "Illustrated postal worker bulldog and customized delivery truck graphic.",
    depth: "foreground",
    progress: [0.54, 0.82],
    path: [
      [0.16, -0.28],
      [0.39, 0.43],
      [0.78, 1.3],
    ],
    rotation: [-8, 11],
    tilt: [-7, 10],
    scale: [0.74, 1.2],
  },
  {
    id: "system-nineteenth-hole",
    category: "brand-systems",
    title: "19th Hole identity family",
    src: "/experience/falling-studio/artwork/system-nineteenth-hole.webp",
    sourceFile: "Portfolio/Logo Design/Logo Design-10.png",
    width: 1200,
    height: 675,
    alt: "19th Hole Bar and Grill logo family with multiple lockup configurations.",
    depth: "midground",
    progress: [0.67, 0.91],
    path: [
      [0.8, -0.22],
      [0.61, 0.39],
      [0.3, 1.18],
    ],
    rotation: [6, -6],
    tilt: [6, -7],
    scale: [0.66, 0.96],
  },
  {
    id: "system-eightysixd",
    category: "brand-systems",
    title: "Eighty Six'd applications",
    src: "/experience/falling-studio/artwork/system-eightysixd.webp",
    sourceFile: "Portfolio/Logo Design/Logo Design-03.png",
    width: 1200,
    height: 675,
    alt: "Eighty Six'd identity exploration with marks, lockups, and hat applications.",
    depth: "foreground",
    progress: [0.72, 0.93],
    path: [
      [0.14, -0.23],
      [0.36, 0.37],
      [0.65, 1.16],
    ],
    rotation: [-6, 7],
    tilt: [-7, 7],
    scale: [0.72, 1.12],
  },
] as const satisfies readonly FallingStudioArtwork[];

export const FALLING_STUDIO_STATIC_ARTWORK = [
  FALLING_STUDIO_ARTWORK[1],
  FALLING_STUDIO_ARTWORK[2],
  FALLING_STUDIO_ARTWORK[4],
  FALLING_STUDIO_ARTWORK[6],
] as const;

export const FALLING_STUDIO_HANDOFF = {
  src: "/experience/brand-development/vested-lockups.webp",
  width: 1600,
  height: 900,
  alt: "Vested Clothing Company lockup exploration entering the Brand Development sequence.",
} as const;
