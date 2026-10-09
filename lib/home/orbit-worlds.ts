export type OrbitWorldId = "designs" | "labs" | "shop";
export type OrbitQualityTier = "compact" | "full";

/** Scene 06 progress map. The stage pins on the studio's final frame, so the
 * first stretch is the arrival: the Designs still recedes into its orbit while
 * the other worlds assemble. Editorial copy lands as the arrival completes. */
export const ORBIT_ARRIVAL_END = 0.3;
export const ORBIT_EDITORIAL_START = 0.15;
export const ORBIT_EDITORIAL_END = 0.3;
export const ORBIT_HANDOFF_START = 0.86;
/** Flow layouts have no scroll choreography; they render this resting state. */
export const ORBIT_REST_PROGRESS = 0.5;
/** Shared by the studio pullback's last frame and the orbit bridge's first. */
export const ORBIT_BRIDGE_SCALE = 0.72;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(value: number, start: number, end: number) {
  const progress = clamp01((value - start) / (end - start));

  return progress * progress * (3 - 2 * progress);
}

export function getOrbitArrivalProgress(progress: number) {
  return clamp01(progress / ORBIT_ARRIVAL_END);
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
  readonly href: "/work" | `https://${string}`;
  readonly ctaLabel: string;
  readonly cardLabel: string;
  readonly previewSrc: `/experience/orbit/stills/${string}.webp`;
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
    ctaLabel: "View portfolio →",
    cardLabel: "Portfolio",
    previewSrc: "/experience/orbit/stills/designs.webp",
    assets: {
      source: "/experience/pen/westcose_designs.glb",
      full: "/experience/orbit/models/westcose_designs.web-full.glb",
      compact:
        "/experience/orbit/models/westcose_designs.web-compact.glb",
    },
    presentation: {
      targetSize: 2.7,
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
      radiusX: 2.88,
      radiusY: 1.77,
      depth: 0.97,
      inclination: 0.38,
      yaw: -0.2,
      roll: -0.08,
      phase: 0.92,
      speed: 0.04,
      bob: 0.075,
    },
    disciplines: "Identity / Illustration / Apparel",
    summary:
      "Explore our portfolio of brand identities, illustration, and apparel graphics.",
    accent: {
      primary: "#d4b48e",
      soft: "#efdbc3",
    },
    visual: "identity",
    textureSrc: "/experience/sketchbook/impala-green.webp",
    textureAlt: "Green impala illustration from the WestCose archive",
  },
  {
    id: "labs",
    label: "WestCose Labs",
    href: "https://westcoselabs.com",
    ctaLabel: "Visit WestCose Labs ↗",
    cardLabel: "Visit Labs",
    previewSrc: "/experience/orbit/stills/labs.webp",
    assets: {
      source:
        "/experience/orbit/models/wc_building_westcose_labs_01_server_satellite_refined.glb",
      full:
        "/experience/orbit/models/wc_building_westcose_labs_01_server_satellite_refined.web-full.glb",
      compact:
        "/experience/orbit/models/wc_building_westcose_labs_01_server_satellite_refined.web-compact.glb",
    },
    presentation: {
      targetSize: 2.7,
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
      radiusX: 3.17,
      radiusY: 1.57,
      depth: 1.17,
      inclination: -0.46,
      yaw: 0.42,
      roll: 0.16,
      phase: 2.6,
      speed: 0.032,
      bob: 0.09,
    },
    disciplines: "Website design / Development",
    summary:
      "Explore our website design and development work, services, and approach.",
    accent: {
      primary: "#72a9d0",
      soft: "#c8dfef",
    },
    visual: "interface",
  },
  {
    id: "shop",
    label: "WestCose Shop",
    href: "https://shop.westcose.com",
    ctaLabel: "Shop WestCose merch ↗",
    cardLabel: "Shop merch",
    previewSrc: "/experience/orbit/stills/shop.webp",
    assets: {
      source:
        "/experience/orbit/models/wc_building_westcose_shop_01_apparel_exterior.glb",
      full:
        "/experience/orbit/models/wc_building_westcose_shop_01_apparel_exterior.web-full.glb",
      compact:
        "/experience/orbit/models/wc_building_westcose_shop_01_apparel_exterior.web-compact.glb",
    },
    presentation: {
      targetSize: 2.7,
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
      radiusX: 3.01,
      radiusY: 1.82,
      depth: 1.06,
      inclination: 0.58,
      yaw: 0.2,
      roll: -0.22,
      phase: 5.22,
      speed: 0.036,
      bob: 0.08,
    },
    disciplines: "Official apparel / Merchandise",
    summary:
      "Shop official WestCose apparel and merchandise.",
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
