export type OrbitWorldId = "designs" | "labs" | "shop";

export const ORBIT_EDITORIAL_START = 0.2;
export const ORBIT_EDITORIAL_END = 0.5;
export const ORBIT_HANDOFF_START = 0.84;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(value: number, start: number, end: number) {
  const progress = clamp01((value - start) / (end - start));

  return progress * progress * (3 - 2 * progress);
}

export function getOrbitEditorialProgress(progress: number) {
  return smoothstep(progress, ORBIT_EDITORIAL_START, ORBIT_EDITORIAL_END);
}

export function getOrbitHandoffProgress(progress: number) {
  return smoothstep(progress, ORBIT_HANDOFF_START, 1);
}

export function getOrbitMotionProgress(progress: number) {
  const clampedProgress = clamp01(progress);

  if (clampedProgress <= ORBIT_HANDOFF_START) {
    return clampedProgress;
  }

  const handoffProgress = clamp01(
    (clampedProgress - ORBIT_HANDOFF_START) / (1 - ORBIT_HANDOFF_START),
  );

  // Preserve positional continuity while the derivative eases to zero.
  return (
    ORBIT_HANDOFF_START +
    (1 - ORBIT_HANDOFF_START) * (handoffProgress - handoffProgress ** 3 / 3)
  );
}

export type OrbitWorld = {
  readonly id: OrbitWorldId;
  readonly label: string;
  readonly href: "/work" | "/westcose-labs" | "/shop";
  readonly modelSrc: `/experience/${string}.${"glb" | "gltf"}`;
  readonly disciplines: string;
  readonly summary: string;
  readonly accent: {
    readonly primary: `#${string}`;
    readonly soft: `#${string}`;
  };
  readonly visual: "identity" | "interface" | "goods";
  readonly textureSrc?: `/${string}`;
  readonly textureAlt?: string;
};

export const ORBIT_CENTER_MODEL_SRC =
  "/experience/orbit/models/w.gltf" as const;

export const ORBIT_WORLDS = [
  {
    id: "designs",
    label: "WestCose Designs",
    href: "/work",
    modelSrc: "/experience/pen/westcose_designs.glb",
    disciplines: "Identity / Illustration / Apparel",
    summary:
      "Brand systems, illustration, and graphic work built to hold together across every application.",
    accent: {
      primary: "#a7c2aa",
      soft: "#d9e6d8",
    },
    visual: "identity",
    textureSrc: "/experience/sketchbook/impala-green.webp",
    textureAlt: "Green impala illustration from the WestCose archive",
  },
  {
    id: "labs",
    label: "WestCose Labs",
    href: "/westcose-labs",
    modelSrc:
      "/experience/orbit/models/wc_building_westcose_labs_01.glb",
    disciplines: "Websites / Software / Experiments",
    summary:
      "Websites, software, and experiments shaped with the same clear visual thinking.",
    accent: {
      primary: "#72a9d0",
      soft: "#c8dfef",
    },
    visual: "interface",
  },
  {
    id: "shop",
    label: "WestCose Shop",
    href: "/shop",
    modelSrc:
      "/experience/orbit/models/wc_building_westcose_shop_01.glb",
    disciplines: "Streetwear / Merch / Objects",
    summary:
      "Apparel, merchandise, and physical objects made for the WestCose world.",
    accent: {
      primary: "#e18453",
      soft: "#f0c0a4",
    },
    visual: "goods",
    textureSrc: "/brand/westcose-logo.svg",
    textureAlt: "WestCose circular patch mark",
  },
] as const satisfies readonly OrbitWorld[];

export function isOrbitWorldId(value: string): value is OrbitWorldId {
  return ORBIT_WORLDS.some((world) => world.id === value);
}

export function getOrbitWorld(worldId: OrbitWorldId) {
  return ORBIT_WORLDS.find((world) => world.id === worldId)!;
}
