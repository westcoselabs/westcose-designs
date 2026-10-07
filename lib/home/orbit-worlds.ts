export type OrbitWorldId = "designs" | "labs" | "shop";
export type OrbitQualityTier = "compact" | "full";

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
  readonly ctaLabel: `Enter ${string}`;
  readonly assets: {
    readonly source: `/experience/${string}.${"glb" | "gltf"}`;
    readonly full: `/experience/${string}.${"glb" | "gltf"}`;
    readonly compact: `/experience/${string}.${"glb" | "gltf"}`;
  };
  readonly presentation: {
    readonly targetSize: number;
    readonly rotation: readonly [number, number, number];
    readonly envMapIntensity: number;
    readonly colorMultiplier: `#${string}`;
    readonly idleSpin: {
      readonly amplitude: number;
      readonly speed: number;
      readonly phase: number;
    };
    readonly focusScale: number;
    readonly focusPosition: {
      readonly full: readonly [number, number, number];
      readonly compact: readonly [number, number, number];
    };
  };
  readonly orbit: {
    readonly radiusX: number;
    readonly radiusY: number;
    readonly depth: number;
    readonly inclination: number;
    readonly yaw: number;
    readonly roll: number;
    readonly phase: number;
    readonly speed: number;
    readonly bob: number;
  };
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
    ctaLabel: "Enter Designs",
    assets: {
      source: "/experience/pen/westcose_designs.glb",
      full: "/experience/orbit/models/westcose_designs.web-full.glb",
      compact:
        "/experience/orbit/models/westcose_designs.web-compact.glb",
    },
    presentation: {
      targetSize: 2.28,
      rotation: [0.08, -0.24, -0.06],
      envMapIntensity: 0.78,
      colorMultiplier: "#d0c5b8",
      idleSpin: {
        amplitude: 0.18,
        speed: 0.16,
        phase: 0.25,
      },
      focusScale: 1.12,
      focusPosition: {
        full: [-1.42, 0.02, 2.38],
        compact: [0, 0.92, 2.46],
      },
    },
    orbit: {
      radiusX: 3.2,
      radiusY: 1.68,
      depth: 1.08,
      inclination: 0.38,
      yaw: -0.2,
      roll: -0.08,
      phase: 0.38,
      speed: 0.082,
      bob: 0.075,
    },
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
    ctaLabel: "Enter Labs",
    assets: {
      source:
        "/experience/orbit/models/wc_building_westcose_labs_01_server_satellite_refined.glb",
      full:
        "/experience/orbit/models/wc_building_westcose_labs_01_server_satellite_refined.web-full.glb",
      compact:
        "/experience/orbit/models/wc_building_westcose_labs_01_server_satellite_refined.web-compact.glb",
    },
    presentation: {
      targetSize: 2.4,
      rotation: [-0.04, 0.3, 0.025],
      envMapIntensity: 1.24,
      colorMultiplier: "#ffffff",
      idleSpin: {
        amplitude: 0.16,
        speed: 0.13,
        phase: 2.1,
      },
      focusScale: 1.08,
      focusPosition: {
        full: [-1.34, -0.04, 2.42],
        compact: [0, 0.9, 2.5],
      },
    },
    orbit: {
      radiusX: 3.52,
      radiusY: 1.94,
      depth: 1.3,
      inclination: -0.46,
      yaw: 0.42,
      roll: 0.16,
      phase: 2.42,
      speed: 0.066,
      bob: 0.09,
    },
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
    ctaLabel: "Enter Shop",
    assets: {
      source:
        "/experience/orbit/models/wc_building_westcose_shop_01_apparel_exterior.glb",
      full:
        "/experience/orbit/models/wc_building_westcose_shop_01_apparel_exterior.web-full.glb",
      compact:
        "/experience/orbit/models/wc_building_westcose_shop_01_apparel_exterior.web-compact.glb",
    },
    presentation: {
      targetSize: 2.32,
      rotation: [0.06, -0.2, 0.045],
      envMapIntensity: 1.12,
      colorMultiplier: "#ffffff",
      idleSpin: {
        amplitude: 0.18,
        speed: 0.145,
        phase: 4.2,
      },
      focusScale: 1.1,
      focusPosition: {
        full: [-1.38, -0.02, 2.4],
        compact: [0, 0.88, 2.48],
      },
    },
    orbit: {
      radiusX: 3.34,
      radiusY: 1.78,
      depth: 1.18,
      inclination: 0.58,
      yaw: 0.2,
      roll: -0.22,
      phase: 4.52,
      speed: 0.074,
      bob: 0.08,
    },
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

export function getOrbitModelSrc(
  world: OrbitWorld,
  quality: OrbitQualityTier,
) {
  return world.assets[quality];
}
