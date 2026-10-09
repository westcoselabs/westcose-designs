"use client";

import {
  Canvas,
  useFrame,
  useLoader,
  useThree,
  type ThreeEvent,
} from "@react-three/fiber";
import {
  Suspense,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  ORBIT_BRIDGE_CONTENT_HEIGHT,
  ORBIT_BRIDGE_FADE,
  renderOrbitBridgeArt,
} from "@/lib/home/orbit-bridge";
import { ORBIT_PALETTE } from "@/lib/home/orbit-palette";

import {
  ORBIT_CENTER_MODEL_SRC,
  ORBIT_WORLDS,
  getOrbitModelSrc,
  getOrbitMotionProgress,
  type OrbitQualityTier,
  type OrbitWorld,
  type OrbitWorldId,
} from "@/lib/home/orbit-worlds";

export type EcosystemOrbitCanvasProps = {
  hoveredWorldId: OrbitWorldId | null;
  activeWorldId: OrbitWorldId | null;
  quality: OrbitQualityTier;
  /** Split frames the system beside the editorial column; stacked centres it. */
  layout: "split" | "stacked";
  resetViewToken: number;
  progressRef: RefObject<number>;
  handoffProgressRef: RefObject<number>;
  /** 0 on the studio's final frame, 1 once every world is in orbit. */
  arrivalProgressRef: RefObject<number>;
  /** The studio still that the canvas lands on the Designs world. */
  bridgeArtRef: RefObject<HTMLElement | null>;
  motionActive: boolean;
  onWorldEnter: (worldId: OrbitWorldId) => void;
  onWorldLeave: () => void;
  onWorldActivate: (worldId: OrbitWorldId) => void;
  onDismiss: () => void;
  onReady: () => void;
  onFailure: () => void;
};

type InspectionControls = {
  pitch: number;
  targetPitch: number;
  yaw: number;
  targetYaw: number;
  zoom: number;
  targetZoom: number;
  pinchDistance: number | null;
  pointers: Map<number, { x: number; y: number }>;
};

type OrbitWorldAnchorProps = {
  world: OrbitWorld;
  model: THREE.Group;
  opacityRef?: RefObject<number>;
  boundsRef?: RefObject<THREE.Vector3 | null>;
  active: boolean;
  resetViewToken: number;
  inspectionControlsRef: RefObject<InspectionControls>;
  onWorldEnter: (worldId: OrbitWorldId) => void;
  onWorldLeave: () => void;
  onWorldActivate: (worldId: OrbitWorldId) => void;
};

const CENTER_MODEL_TARGET_SIZE = 1.66;
const INSPECTION_ZOOM_MIN = 0.85;
const INSPECTION_ZOOM_MAX = 1.35;
const DRAG_ROTATION_SPEED = 0.0075;
const ORBIT_COLLISION_PASSES = 3;
const CAMERA_HALF_FOV_TAN = Math.tan(THREE.MathUtils.degToRad(21.5));

type OrbitFraming = {
  /** Horizontal principal point, as a fraction of the canvas width. */
  lens: number;
  /** Orbiting worlds read larger than their inspection framing. */
  worldScale: number;
  emblemScale: number;
  /** Orbit shape multipliers; portrait canvases stretch the system taller. */
  stretch: readonly [number, number];
  /** Minimum on-screen spacing between worlds, and around the emblem. */
  collision: number;
  emblemClearance: number;
  /** World-space half extents the camera keeps in frame. */
  halfExtent: readonly [number, number];
  minCameraZ: number;
  /** Aiming above the origin settles the system lower in the frame. */
  lookHeight: number;
};

const ORBIT_FRAMING: Record<"split" | "stacked", OrbitFraming> = {
  // Beside the editorial column: the lens sits at 70% of the viewport.
  split: {
    lens: 0.7,
    worldScale: 1.26,
    emblemScale: 1,
    stretch: [1, 1],
    collision: 2.8,
    emblemClearance: 2.35,
    halfExtent: [4.9, 3.8],
    minCameraZ: 12.4,
    lookHeight: 0.55,
  },
  // Above the cards on phones and tablets: taller orbits, larger worlds.
  stacked: {
    lens: 0.46,
    worldScale: 1.45,
    emblemScale: 1.2,
    stretch: [0.72, 1.7],
    collision: 3.7,
    emblemClearance: 2.6,
    halfExtent: [5.25, 5.2],
    minCameraZ: 12.8,
    lookHeight: 0,
  },
};

/**
 * Arrival choreography, in arrival progress. The studio still lands on the
 * Designs world first, then the two crossfade; Labs and Shop grow in from deep
 * space and the emblem turns to face the camera last.
 */
const WORLD_ARRIVALS: Record<
  OrbitWorldId,
  { start: number; end: number; offset: THREE.Vector3 }
> = {
  designs: {
    start: ORBIT_BRIDGE_FADE[0],
    end: ORBIT_BRIDGE_FADE[1],
    offset: new THREE.Vector3(),
  },
  labs: { start: 0.08, end: 0.6, offset: new THREE.Vector3(-1.6, -0.5, -8.5) },
  shop: { start: 0.2, end: 0.72, offset: new THREE.Vector3(1.4, -1.3, -8.5) },
};
const EMBLEM_ARRIVAL = { start: 0.36, end: 0.9, turn: -1.5 };
const PATH_ARRIVAL = { start: 0.18, stagger: 0.08, length: 0.6 };

function smoothstep(value: number, start: number, end: number) {
  return THREE.MathUtils.smoothstep(value, start, end);
}

/** Shifts the principal point so the system frames right of the editorial
 * column without a separate canvas column that could clip a planet. */
function applyLens(
  camera: THREE.Camera,
  width: number,
  height: number,
  center: number,
) {
  if (!(camera instanceof THREE.PerspectiveCamera) || height <= 0) {
    return;
  }

  const fullWidth = width * 2 * Math.max(center, 1 - center);
  const offsetX = center >= 0.5 ? 0 : fullWidth - width;
  const aspect = fullWidth / height;
  const view = camera.view;

  if (
    view?.enabled &&
    camera.aspect === aspect &&
    view.fullWidth === fullWidth &&
    view.offsetX === offsetX &&
    view.width === width &&
    view.height === height
  ) {
    return;
  }

  camera.aspect = aspect;
  camera.setViewOffset(fullWidth, height, offsetX, 0, width, height);
}

const ORBIT_PLANE_ROTATIONS = Object.fromEntries(
  ORBIT_WORLDS.map((world) => [
    world.id,
    new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        world.orbit.inclination,
        world.orbit.yaw,
        world.orbit.roll,
        "YXZ",
      ),
    ),
  ]),
) as Record<OrbitWorldId, THREE.Quaternion>;

const ORBIT_ACCENT_COLORS = Object.fromEntries(
  ORBIT_WORLDS.map((world) => [
    world.id,
    new THREE.Color(world.accent.primary),
  ]),
) as Record<OrbitWorldId, THREE.Color>;

function resetInspectionControls(controls: InspectionControls) {
  controls.pitch = 0;
  controls.targetPitch = 0;
  controls.yaw = 0;
  controls.targetYaw = 0;
  controls.zoom = 1;
  controls.targetZoom = 1;
  controls.pinchDistance = null;
  controls.pointers.clear();
}

function getOrbitPoint(
  world: OrbitWorld,
  angle: number,
  target: THREE.Vector3,
) {
  target
    .set(
      Math.cos(angle) * world.orbit.radiusX,
      Math.sin(angle) * world.orbit.radiusY,
      Math.cos(angle) * world.orbit.depth,
    )
    .applyQuaternion(ORBIT_PLANE_ROTATIONS[world.id]);

  return target;
}

function getPointerDistance(
  first: { x: number; y: number },
  second: { x: number; y: number },
) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function RendererLifecycle({
  motionActive,
  onFailure,
  onReady,
}: Pick<EcosystemOrbitCanvasProps, "motionActive" | "onFailure" | "onReady">) {
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    const canvas = gl.domElement;
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      onFailure();
    };
    const handleContextRestored = () => invalidate();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        invalidate();
      }
    };

    canvas.addEventListener("webglcontextlost", handleContextLost);
    canvas.addEventListener("webglcontextrestored", handleContextRestored);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    onReady();
    invalidate();

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [gl, invalidate, onFailure, onReady]);

  useEffect(() => {
    if (motionActive) {
      invalidate();
    }
  }, [invalidate, motionActive]);

  return null;
}

function SceneEnvironment() {
  const gl = useThree((state) => state.gl);
  const environment = useMemo(() => {
    const room = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(gl);
    const texture = pmrem.fromScene(room, 0.04).texture;

    return {
      texture,
      dispose: () => {
        texture.dispose();
        pmrem.dispose();
        room.dispose();
      },
    };
  }, [gl]);

  useEffect(() => () => environment.dispose(), [environment]);

  return (
    <>
      <primitive attach="environment" object={environment.texture} />
      <fogExp2 attach="fog" args={[ORBIT_PALETTE.canvas, 0.026]} />
    </>
  );
}

function NormalizedModel({
  model,
  rotation = [0, 0, 0],
  targetSize,
  envMapIntensity = 1.18,
  colorMultiplier = "#ffffff",
  metallic = false,
  opacityRef,
  boundsRef,
}: {
  model: THREE.Group;
  rotation?: readonly [number, number, number];
  targetSize: number;
  envMapIntensity?: number;
  colorMultiplier?: `#${string}`;
  metallic?: boolean;
  /** Fades the model with ordinary transparency while below 1. */
  opacityRef?: RefObject<number>;
  /** Receives the normalized bounding-box size, centred on the origin. */
  boundsRef?: RefObject<THREE.Vector3 | null>;
}) {
  const appliedFadeRef = useRef<{ materials: THREE.Material[]; opacity: number } | null>(null);
  const prepared = useMemo(() => {
    const object = model.clone(true);
    const materials: THREE.Material[] = [];

    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }

      const cloneMaterial = (material: THREE.Material) => {
        const clone = material.clone();

        if (clone instanceof THREE.MeshStandardMaterial) {
          clone.envMapIntensity = envMapIntensity;
          clone.color.multiply(new THREE.Color(colorMultiplier));
          if (metallic) {
            clone.metalness = 0.82;
            clone.roughness = 0.32;
          }
        }

        clone.userData.baseOpacity = clone.opacity;
        clone.userData.baseTransparent = clone.transparent;

        clone.needsUpdate = true;
        materials.push(clone);
        return clone;
      };

      child.material = Array.isArray(child.material)
        ? child.material.map(cloneMaterial)
        : cloneMaterial(child.material);
    });

    object.updateMatrixWorld(true);

    const bounds = new THREE.Box3().setFromObject(object, true);
    const size = bounds.getSize(new THREE.Vector3());
    const largestDimension = Math.max(size.x, size.y, size.z);

    if (bounds.isEmpty() || largestDimension <= Number.EPSILON) {
      return {
        object,
        materials,
        position: [0, 0, 0] as [number, number, number],
        scale: 1,
        size: new THREE.Vector3(),
      };
    }

    const scale = targetSize / largestDimension;
    const center = bounds.getCenter(new THREE.Vector3()).multiplyScalar(-scale);

    return {
      object,
      materials,
      position: center.toArray() as [number, number, number],
      scale,
      size: size.multiplyScalar(scale),
    };
  }, [colorMultiplier, envMapIntensity, metallic, model, targetSize]);

  useEffect(() => {
    if (!boundsRef) {
      return;
    }

    boundsRef.current = prepared.size;

    return () => {
      boundsRef.current = null;
    };
  }, [boundsRef, prepared]);

  useEffect(
    () => () => {
      prepared.materials.forEach((material) => material.dispose());
    },
    [prepared],
  );

  useFrame((state) => {
    const opacity = opacityRef?.current ?? 1;
    const applied = appliedFadeRef.current;

    if (applied?.materials === prepared.materials && applied.opacity === opacity) {
      return;
    }

    // The fade is written by the universe later in this frame; with an
    // on-demand loop, ask for one more frame so the newest value lands.
    state.invalidate();

    appliedFadeRef.current = { materials: prepared.materials, opacity };
    prepared.materials.forEach((material) => {
      const transparent = material.userData.baseTransparent === true || opacity < 1;

      if (material.transparent !== transparent) {
        material.transparent = transparent;
        material.needsUpdate = true;
      }

      material.opacity = (material.userData.baseOpacity ?? 1) * opacity;
    });
  });

  return (
    <group rotation={[rotation[0], rotation[1], rotation[2]]}>
      <group position={prepared.position} scale={prepared.scale}>
        <primitive object={prepared.object} />
      </group>
    </group>
  );
}

function CentralMark({ model }: { model: THREE.Group }) {
  return <NormalizedModel model={model} targetSize={CENTER_MODEL_TARGET_SIZE} colorMultiplier={ORBIT_PALETTE.tan} metallic />;
}

function OrbitPath({
  world,
  index,
  quality,
  activeWorldId,
  arrivalProgressRef,
}: {
  world: OrbitWorld;
  index: number;
  quality: OrbitQualityTier;
  activeWorldId: OrbitWorldId | null;
  arrivalProgressRef: RefObject<number>;
}) {
  const lineRef = useRef<THREE.Line>(null);
  const opacityRef = useRef(0.15);
  const line = useMemo(() => {
    const segmentCount = quality === "full" ? 144 : 72;
    // Drawn from the world's starting phase so the path traces its travel.
    const points = Array.from({ length: segmentCount + 1 }, (_, pointIndex) =>
      getOrbitPoint(
        world,
        world.orbit.phase + (pointIndex / segmentCount) * Math.PI * 2,
        new THREE.Vector3(),
      ),
    );
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: ORBIT_PALETTE.tan,
      depthWrite: false,
      opacity: 0.16,
      transparent: true,
      toneMapped: false,
    });

    return new THREE.Line(geometry, material);
  }, [quality, world]);

  useFrame((_, delta) => {
    const path = lineRef.current;
    const material = path?.material as THREE.LineBasicMaterial | undefined;

    if (!path || !material) {
      return;
    }

    const targetOpacity = activeWorldId
      ? activeWorldId === world.id
        ? 0.24
        : 0.045
      : 0.15;
    const arrival = activeWorldId ? 1 : arrivalProgressRef.current;
    const drawStart = PATH_ARRIVAL.start + index * PATH_ARRIVAL.stagger;
    const draw = smoothstep(arrival, drawStart, drawStart + PATH_ARRIVAL.length);
    const pointCount = path.geometry.getAttribute("position").count;

    opacityRef.current = THREE.MathUtils.damp(
      opacityRef.current,
      targetOpacity,
      5,
      delta,
    );
    material.opacity = opacityRef.current * Math.min(1, draw * 1.6);
    path.geometry.setDrawRange(0, draw >= 1 ? Infinity : Math.ceil(draw * pointCount));
    path.visible = draw > 0;
  });

  useEffect(
    () => () => {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    },
    [line],
  );

  return <primitive ref={lineRef} object={line} />;
}

function DepthParticles({
  quality,
  arrivalProgressRef,
}: {
  quality: OrbitQualityTier;
  arrivalProgressRef: RefObject<number>;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const baseOpacity = quality === "full" ? 0.34 : 0.27;
  const positions = useMemo(() => {
    const count = quality === "full" ? 190 : 86;
    const values = new Float32Array(count * 3);
    let seed = 0x9e3779b9;
    const random = () => {
      seed += 0x6d2b79f5;
      let value = seed;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };

    for (let index = 0; index < count; index += 1) {
      const radius = 3.8 + random() * 7.4;
      const azimuth = random() * Math.PI * 2;
      const elevation = (random() - 0.5) * Math.PI * 0.72;
      const offset = index * 3;

      values[offset] = Math.cos(azimuth) * Math.cos(elevation) * radius;
      values[offset + 1] = Math.sin(elevation) * radius * 0.62;
      values[offset + 2] = Math.sin(azimuth) * Math.cos(elevation) * radius - 2;
    }

    return values;
  }, [quality]);

  useFrame((state, delta) => {
    const points = pointsRef.current;

    if (points) {
      points.rotation.y += delta * 0.0035;
      points.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.04) * 0.025;
      (points.material as THREE.PointsMaterial).opacity =
        baseOpacity * smoothstep(arrivalProgressRef.current, 0, 0.7);
    }
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={ORBIT_PALETTE.tanLight}
        depthWrite={false}
        opacity={baseOpacity}
        size={quality === "full" ? 0.026 : 0.032}
        sizeAttenuation
        toneMapped={false}
        transparent
      />
    </points>
  );
}

const OrbitWorldAnchor = forwardRef<THREE.Group, OrbitWorldAnchorProps>(
  function OrbitWorldAnchor(
    {
      world,
      model,
      opacityRef,
      boundsRef,
      active,
      resetViewToken,
      inspectionControlsRef,
      onWorldEnter,
      onWorldLeave,
      onWorldActivate,
    },
    ref,
  ) {
    const inspectionGroupRef = useRef<THREE.Group>(null);

    useEffect(() => {
      if (active) {
        resetInspectionControls(inspectionControlsRef.current);
      }
    }, [active, inspectionControlsRef, resetViewToken]);

    useFrame((_, delta) => {
      const group = inspectionGroupRef.current;
      const controls = inspectionControlsRef.current;

      if (active) {
        controls.pitch = THREE.MathUtils.damp(
          controls.pitch,
          controls.targetPitch,
          10,
          delta,
        );
        controls.yaw = THREE.MathUtils.damp(
          controls.yaw,
          controls.targetYaw,
          10,
          delta,
        );
        controls.zoom = THREE.MathUtils.damp(
          controls.zoom,
          controls.targetZoom,
          10,
          delta,
        );
      }

      if (group && active) {
        group.rotation.x = controls.pitch;
        group.rotation.y = controls.yaw;
      } else if (group) {
        group.rotation.x = THREE.MathUtils.damp(
          group.rotation.x,
          0,
          8,
          delta,
        );
        group.rotation.y = THREE.MathUtils.damp(
          group.rotation.y,
          0,
          8,
          delta,
        );
      }
    });

    const updatePinch = (controls: InspectionControls) => {
      const pointers = Array.from(controls.pointers.values());

      if (pointers.length < 2) {
        controls.pinchDistance = null;
        return;
      }

      const nextDistance = getPointerDistance(pointers[0], pointers[1]);

      if (controls.pinchDistance && controls.pinchDistance > 0) {
        controls.targetZoom = THREE.MathUtils.clamp(
          controls.targetZoom * (nextDistance / controls.pinchDistance),
          INSPECTION_ZOOM_MIN,
          INSPECTION_ZOOM_MAX,
        );
      }

      controls.pinchDistance = nextDistance;
    };

    const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
      if (!active || event.button !== 0) {
        return;
      }

      event.stopPropagation();
      const captureTarget = event.target as unknown as {
        setPointerCapture?: (pointerId: number) => void;
      };
      captureTarget.setPointerCapture?.(event.pointerId);

      const controls = inspectionControlsRef.current;
      controls.pointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });
      updatePinch(controls);
    };

    const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
      if (!active) {
        return;
      }

      const controls = inspectionControlsRef.current;
      const previous = controls.pointers.get(event.pointerId);

      if (!previous) {
        return;
      }

      event.stopPropagation();
      controls.pointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });

      if (controls.pointers.size >= 2) {
        updatePinch(controls);
        return;
      }

      controls.targetYaw += (event.clientX - previous.x) * DRAG_ROTATION_SPEED;
      controls.targetPitch = THREE.MathUtils.clamp(
        controls.targetPitch +
          (event.clientY - previous.y) * DRAG_ROTATION_SPEED,
        -1.05,
        1.05,
      );
    };

    const handlePointerEnd = (event: ThreeEvent<PointerEvent>) => {
      const controls = inspectionControlsRef.current;
      controls.pointers.delete(event.pointerId);
      const captureTarget = event.target as unknown as {
        releasePointerCapture?: (pointerId: number) => void;
      };
      captureTarget.releasePointerCapture?.(event.pointerId);
      updatePinch(controls);
    };

    const handleWheel = (event: ThreeEvent<WheelEvent>) => {
      if (!active) {
        return;
      }

      event.stopPropagation();
      event.nativeEvent.preventDefault();
      const controls = inspectionControlsRef.current;
      controls.targetZoom = THREE.MathUtils.clamp(
        controls.targetZoom - event.deltaY * 0.00075,
        INSPECTION_ZOOM_MIN,
        INSPECTION_ZOOM_MAX,
      );
    };

    return (
      <group
        ref={ref}
        onPointerOver={(event) => {
          event.stopPropagation();
          onWorldEnter(world.id);
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          if (!active) {
            onWorldLeave();
          }
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onWheel={handleWheel}
        onClick={(event) => {
          event.stopPropagation();
          if (!active && event.delta <= 6) {
            onWorldActivate(world.id);
          }
        }}
      >
        <group ref={inspectionGroupRef}>
          <NormalizedModel
            colorMultiplier={world.presentation.colorMultiplier}
            envMapIntensity={world.presentation.envMapIntensity}
            model={model}
            opacityRef={opacityRef}
            boundsRef={boundsRef}
            rotation={world.presentation.rotation}
            targetSize={world.presentation.targetSize}
          />
        </group>

        <mesh>
          <sphereGeometry args={[1.58, 18, 18]} />
          <meshBasicMaterial
            colorWrite={false}
            depthWrite={false}
            opacity={0}
            transparent
          />
        </mesh>
      </group>
    );
  },
);

type OrbitWorldPose = {
  position: THREE.Vector3;
  scale: number;
};

const DESIGNS_WORLD = ORBIT_WORLDS.find((world) => world.id === "designs")!;
const DESIGNS_ROTATION = new THREE.Matrix4().makeRotationFromEuler(
  new THREE.Euler(...DESIGNS_WORLD.presentation.rotation),
);
const BOX_CORNERS = Array.from(
  { length: 8 },
  (_, index) =>
    new THREE.Vector3(
      index & 1 ? 0.5 : -0.5,
      index & 2 ? 0.5 : -0.5,
      index & 4 ? 0.5 : -0.5,
    ),
);

function OrbitUniverse({
  hoveredWorldId,
  activeWorldId,
  quality,
  layout,
  resetViewToken,
  progressRef,
  handoffProgressRef,
  arrivalProgressRef,
  bridgeArtRef,
  motionActive,
  onWorldEnter,
  onWorldLeave,
  onWorldActivate,
  onReady,
  onFailure,
}: EcosystemOrbitCanvasProps) {
  const modelSources = useMemo(
    () => [
      ORBIT_CENTER_MODEL_SRC,
      ...ORBIT_WORLDS.map((world) => getOrbitModelSrc(world, quality)),
    ],
    [quality],
  );
  const [centerModel, ...worldModels] = useLoader(
    GLTFLoader,
    modelSources,
    (loader) => loader.setMeshoptDecoder(MeshoptDecoder),
  );
  const worldRefs = useRef<Record<OrbitWorldId, THREE.Group | null>>({
    designs: null,
    labs: null,
    shop: null,
  });
  const orbitElapsedRef = useRef(0);
  const universeRef = useRef<THREE.Group>(null);
  const centerRef = useRef<THREE.Group>(null);
  const focusLightRef = useRef<THREE.PointLight>(null);
  const cameraTargetRef = useRef(new THREE.Vector3());
  const orbitTargetsRef = useRef<Record<OrbitWorldId, THREE.Vector3>>({
    designs: new THREE.Vector3(),
    labs: new THREE.Vector3(),
    shop: new THREE.Vector3(),
  });
  const orbitAnglesRef = useRef<Record<OrbitWorldId, number>>({
    designs: 0,
    labs: 0,
    shop: 0,
  });
  // Damped resting poses. Arrival offsets and fades are layered on per frame,
  // so scrubbing the arrival never fights the hover and inspection damping.
  const worldPosesRef = useRef<Record<OrbitWorldId, OrbitWorldPose> | null>(
    null,
  );
  // Only Designs fades: it crossfades with the studio still it replaces.
  const designsOpacityRef = useRef(0);
  const designsBoundsRef = useRef<THREE.Vector3 | null>(null);
  const pathsRef = useRef<THREE.Group>(null);
  const centerScaleRef = useRef(1);
  const framing = ORBIT_FRAMING[layout];
  const lensRef = useRef(framing.lens);
  const bridgeMatrixRef = useRef(new THREE.Matrix4());
  const bridgeQuaternionRef = useRef(new THREE.Quaternion());
  const bridgeScaleRef = useRef(new THREE.Vector3());
  const bridgeCornerRef = useRef(new THREE.Vector3());
  const lastBridgeArrivalRef = useRef<number | null>(null);
  const inspectionControlsRef = useRef<InspectionControls>({
    pitch: 0,
    targetPitch: 0,
    yaw: 0,
    targetYaw: 0,
    zoom: 1,
    targetZoom: 1,
    pinchDistance: null,
    pointers: new Map(),
  });
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();
  }, [
    activeWorldId,
    hoveredWorldId,
    invalidate,
    layout,
    quality,
    resetViewToken,
  ]);

  useFrame((state, delta) => {
    const documentVisible = document.visibilityState !== "hidden";

    const handoffMotionScale = activeWorldId
      ? 1
      : 1 - THREE.MathUtils.smoothstep(handoffProgressRef.current, 0, 1);

    if (
      motionActive &&
      documentVisible &&
      !activeWorldId
    ) {
      orbitElapsedRef.current += Math.min(delta, 0.05) * handoffMotionScale;
    }

    const scrollPhase = getOrbitMotionProgress(progressRef.current) * 0.08;

    const hasActiveWorld = activeWorldId !== null;
    const arrival = hasActiveWorld ? 1 : arrivalProgressRef.current;

    ORBIT_WORLDS.forEach((world, index) => {
      const angle =
        world.orbit.phase +
        orbitElapsedRef.current * world.orbit.speed +
        scrollPhase;
      const orbitTarget = orbitTargetsRef.current[world.id];
      const isActive = activeWorldId === world.id;
      const focusPosition = world.presentation.focusPosition[quality];

      orbitAnglesRef.current[world.id] = angle;

      if (isActive) {
        orbitTarget.set(focusPosition[0], focusPosition[1], focusPosition[2]);
      } else {
        getOrbitPoint(world, angle, orbitTarget);
        orbitTarget.x *= framing.stretch[0];
        orbitTarget.y *= framing.stretch[1];
        orbitTarget.y +=
          Math.sin(orbitElapsedRef.current * 0.42 + index) * world.orbit.bob;
        orbitTarget.z -= hasActiveWorld ? 2.4 : 0;
      }
    });

    if (!hasActiveWorld) {
      for (let pass = 0; pass < ORBIT_COLLISION_PASSES; pass += 1) {
        for (let firstIndex = 0; firstIndex < ORBIT_WORLDS.length; firstIndex += 1) {
          for (
            let secondIndex = firstIndex + 1;
            secondIndex < ORBIT_WORLDS.length;
            secondIndex += 1
          ) {
            const first = orbitTargetsRef.current[ORBIT_WORLDS[firstIndex].id];
            const second = orbitTargetsRef.current[ORBIT_WORLDS[secondIndex].id];
            const deltaX = second.x - first.x;
            const deltaY = second.y - first.y;
            const distance = Math.hypot(deltaX, deltaY);

            if (distance >= framing.collision) {
              continue;
            }

            const safeDistance = Math.max(distance, 0.001);
            const push = (framing.collision - safeDistance) * 0.5;
            const directionX = distance > 0.001 ? deltaX / safeDistance : 1;
            const directionY = distance > 0.001 ? deltaY / safeDistance : 0;

            first.x -= directionX * push;
            first.y -= directionY * push;
            second.x += directionX * push;
            second.y += directionY * push;
          }
        }

        // Keep every world clear of the emblem at the centre.
        ORBIT_WORLDS.forEach((world) => {
          const target = orbitTargetsRef.current[world.id];
          const distance = Math.hypot(target.x, target.y);

          if (distance < framing.emblemClearance) {
            const push = framing.emblemClearance / Math.max(distance, 0.001);
            target.x = distance > 0.001 ? target.x * push : framing.emblemClearance;
            target.y *= distance > 0.001 ? push : 1;
          }
        });
      }
    }

    // The first frame starts every world in orbit rather than flying out of the centre.
    worldPosesRef.current ??= Object.fromEntries(
      ORBIT_WORLDS.map((world) => [
        world.id,
        {
          position: orbitTargetsRef.current[world.id].clone(),
          scale: framing.worldScale,
        },
      ]),
    ) as Record<OrbitWorldId, OrbitWorldPose>;

    const worldPoses = worldPosesRef.current;

    ORBIT_WORLDS.forEach((world) => {
      const group = worldRefs.current[world.id];

      if (!group) {
        return;
      }

      const pose = worldPoses[world.id];
      const angle = orbitAnglesRef.current[world.id];
      const isActive = activeWorldId === world.id;
      const isHovered = hoveredWorldId === world.id;
      const orbitTarget = orbitTargetsRef.current[world.id];
      const targetScale = isActive
        ? world.presentation.focusScale * inspectionControlsRef.current.zoom
        : hasActiveWorld
          ? 0.58
          : (isHovered ? 1.08 : 1) * framing.worldScale;
      const entrance = WORLD_ARRIVALS[world.id];
      const reveal = smoothstep(arrival, entrance.start, entrance.end);
      const isDesigns = world.id === "designs";
      // Designs keeps full size beneath the still and fades instead; the others
      // grow out of the distance.
      const growth = isDesigns ? 1 : reveal;

      pose.position.x = THREE.MathUtils.damp(
        pose.position.x,
        orbitTarget.x,
        isActive ? 6.8 : 4.3,
        delta,
      );
      pose.position.y = THREE.MathUtils.damp(
        pose.position.y,
        orbitTarget.y,
        isActive ? 6.8 : 4.3,
        delta,
      );
      pose.position.z = THREE.MathUtils.damp(
        pose.position.z,
        orbitTarget.z,
        isActive ? 7.4 : 4.9,
        delta,
      );
      pose.scale = THREE.MathUtils.damp(pose.scale, targetScale, 7.2, delta);

      group.position
        .copy(pose.position)
        .addScaledVector(entrance.offset, 1 - reveal);
      group.scale.setScalar(reveal > 0 ? pose.scale * growth : 0.0001);
      // Hidden Designs still renders at a speck so its fade shader compiles
      // before the crossfade, not during it.
      group.visible = isDesigns || reveal > 0;

      if (isDesigns) {
        designsOpacityRef.current = reveal;
      }
      group.rotation.y = THREE.MathUtils.damp(
        group.rotation.y,
        isActive
          ? 0
          : Math.sin(
              orbitElapsedRef.current * world.presentation.idleSpin.speed +
                world.presentation.idleSpin.phase,
            ) * world.presentation.idleSpin.amplitude,
        4.5,
        delta,
      );
      group.rotation.z = THREE.MathUtils.damp(
        group.rotation.z,
        isActive
          ? 0
          : Math.sin(angle + world.presentation.idleSpin.phase) * 0.055,
        4,
        delta,
      );
    });

    const universe = universeRef.current;
    const center = centerRef.current;

    if (universe) {
      universe.position.x = THREE.MathUtils.damp(
        universe.position.x,
        0,
        5.4,
        delta,
      );
      universe.scale.setScalar(
        THREE.MathUtils.damp(
          universe.scale.x,
          1,
          5.4,
          delta,
        ),
      );
    }

    if (center) {
      const emblem = smoothstep(
        arrival,
        EMBLEM_ARRIVAL.start,
        EMBLEM_ARRIVAL.end,
      );

      center.position.z = THREE.MathUtils.damp(
        center.position.z,
        activeWorldId ? -2 : 0,
        5.2,
        delta,
      );
      centerScaleRef.current = THREE.MathUtils.damp(
        centerScaleRef.current,
        activeWorldId ? 0.52 : framing.emblemScale,
        5.2,
        delta,
      );
      center.scale.setScalar(
        emblem > 0 ? centerScaleRef.current * emblem : 0.0001,
      );
      center.rotation.y = (1 - emblem) * EMBLEM_ARRIVAL.turn;
      center.visible = emblem > 0;
    }

    pathsRef.current?.scale.set(framing.stretch[0], framing.stretch[1], 1);

    const lensTarget = activeWorldId ? 0.5 : framing.lens;

    lensRef.current = THREE.MathUtils.damp(lensRef.current, lensTarget, 4.2, delta);

    if (Math.abs(lensRef.current - lensTarget) < 0.0005) {
      lensRef.current = lensTarget;
    }

    applyLens(state.camera, state.size.width, state.size.height, lensRef.current);

    // The system is framed into the column the lens centres on.
    const frameAspect =
      (state.size.width * 2 * (1 - Math.max(lensRef.current, 1 - lensRef.current))) /
      state.size.height;
    const pointerParallax = quality === "full" && !activeWorldId ? 1 : 0;
    const targetCameraX = state.pointer.x * 0.2 * pointerParallax;
    const targetCameraY =
      0.18 + state.pointer.y * 0.12 * pointerParallax;
    const targetCameraZ = activeWorldId
      ? 8.72
      : Math.max(
          framing.minCameraZ,
          framing.halfExtent[0] / (CAMERA_HALF_FOV_TAN * frameAspect) + 1.2,
          framing.halfExtent[1] / CAMERA_HALF_FOV_TAN + 1.2,
        );

    state.camera.position.x = THREE.MathUtils.damp(
      state.camera.position.x,
      targetCameraX,
      4.2,
      delta,
    );
    state.camera.position.y = THREE.MathUtils.damp(
      state.camera.position.y,
      targetCameraY,
      4.2,
      delta,
    );
    state.camera.position.z = THREE.MathUtils.damp(
      state.camera.position.z,
      targetCameraZ,
      5.2,
      delta,
    );

    cameraTargetRef.current.set(
      0,
      activeWorldId
        ? (quality === "compact" ? 0.28 : 0.02)
        : framing.lookHeight,
      activeWorldId ? 0.18 : -0.08,
    );
    state.camera.lookAt(cameraTargetRef.current);
    state.camera.updateMatrixWorld();

    // Land the studio still on the Designs world's resting pose. The final
    // write (arrival 1) hides it; later frames skip the DOM entirely.
    const bridgeArt = bridgeArtRef.current;
    const bridgeArrival = arrivalProgressRef.current;

    if (
      bridgeArt &&
      !activeWorldId &&
      (bridgeArrival < 1 || lastBridgeArrivalRef.current !== bridgeArrival)
    ) {
      const bounds = designsBoundsRef.current;
      const designsGroup = worldRefs.current.designs;

      lastBridgeArrivalRef.current = bridgeArrival;

      if (bounds && designsGroup) {
        // Project the model's resting bounding box (its full size, ignoring the
        // speck it is drawn at while hidden) and land the still on it.
        const matrix = bridgeMatrixRef.current
          .compose(
            worldPoses.designs.position,
            bridgeQuaternionRef.current.setFromEuler(designsGroup.rotation),
            bridgeScaleRef.current.setScalar(worldPoses.designs.scale),
          )
          .multiply(DESIGNS_ROTATION);

        if (universe) {
          matrix.premultiply(universe.matrixWorld);
        }

        const canvasRect = gl.domElement.getBoundingClientRect();
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        BOX_CORNERS.forEach((corner) => {
          const point = bridgeCornerRef.current
            .copy(corner)
            .multiply(bounds)
            .applyMatrix4(matrix)
            .project(state.camera);
          const x = canvasRect.left + ((point.x + 1) / 2) * canvasRect.width;
          const y = canvasRect.top + ((1 - point.y) / 2) * canvasRect.height;

          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        });

        renderOrbitBridgeArt(bridgeArt, bridgeArrival, {
          x: (minX + maxX) / 2,
          y: (minY + maxY) / 2,
          width: (maxY - minY) / ORBIT_BRIDGE_CONTENT_HEIGHT,
        });
      }
    }

    const focusWorldId = activeWorldId ?? hoveredWorldId;
    const focusGroup = focusWorldId ? worldRefs.current[focusWorldId] : null;
    const focusLight = focusLightRef.current;

    if (focusLight) {
      const targetColor = focusWorldId
        ? ORBIT_ACCENT_COLORS[focusWorldId]
        : ORBIT_ACCENT_COLORS.designs;
      const universeOffsetX = universe?.position.x ?? 0;

      focusLight.position.x = THREE.MathUtils.damp(
        focusLight.position.x,
        (focusGroup?.position.x ?? 1.8) + universeOffsetX + 0.45,
        4.8,
        delta,
      );
      focusLight.position.y = THREE.MathUtils.damp(
        focusLight.position.y,
        (focusGroup?.position.y ?? 1.25) + 0.5,
        4.8,
        delta,
      );
      focusLight.position.z = THREE.MathUtils.damp(
        focusLight.position.z,
        (focusGroup?.position.z ?? 1.5) + 2.2,
        4.8,
        delta,
      );
      focusLight.intensity = THREE.MathUtils.damp(
        focusLight.intensity,
        focusWorldId === "designs"
          ? activeWorldId
            ? 12
            : hoveredWorldId
              ? 9
              : 7
          : activeWorldId
            ? 18
            : hoveredWorldId
              ? 13
              : 9,
        4.8,
        delta,
      );
      focusLight.color.lerp(targetColor, 1 - Math.exp(-delta * 6));
    }

    if (
      documentVisible &&
      (motionActive || activeWorldId !== null || hoveredWorldId !== null)
    ) {
      state.invalidate();
    }
  });

  return (
    <>
      <RendererLifecycle
        motionActive={motionActive || activeWorldId !== null}
        onFailure={onFailure}
        onReady={onReady}
      />
      <SceneEnvironment />
      <ambientLight color={ORBIT_PALETTE.ambient} intensity={0.72} />
      <hemisphereLight
        color={ORBIT_PALETTE.tanLight}
        groundColor={ORBIT_PALETTE.surface}
        intensity={1.9}
      />
      <directionalLight
        color={ORBIT_PALETTE.key}
        intensity={4.4}
        position={[4.8, 7.2, 6.5]}
      />
      <directionalLight
        color={ORBIT_PALETTE.fill}
        intensity={2.45}
        position={[-5.5, 2.2, 4.2]}
      />
      <directionalLight
        color={ORBIT_PALETTE.rim}
        intensity={2.9}
        position={[0.6, -4.8, -3.5]}
      />
      <pointLight
        ref={focusLightRef}
        color={ORBIT_PALETTE.tan}
        decay={1.7}
        distance={10}
        intensity={9}
        position={[1.8, 1.25, 3.7]}
      />
      <pointLight
        color={ORBIT_PALETTE.ember}
        decay={1.8}
        distance={9}
        intensity={7.5}
        position={[-3.2, -1.8, 4.1]}
      />

      <DepthParticles quality={quality} arrivalProgressRef={arrivalProgressRef} />

      <group ref={universeRef}>
        <group ref={centerRef}>
          <CentralMark model={centerModel.scene} />
        </group>

        {/* Paths share the worlds' layout stretch; lines tolerate the scale. */}
        <group ref={pathsRef}>
          {ORBIT_WORLDS.map((world, index) => (
            <OrbitPath
              key={`path-${world.id}`}
              world={world}
              index={index}
              quality={quality}
              activeWorldId={activeWorldId}
              arrivalProgressRef={arrivalProgressRef}
            />
          ))}
        </group>

        {ORBIT_WORLDS.map((world, index) => (
          <OrbitWorldAnchor
            key={world.id}
            ref={(group) => {
              worldRefs.current[world.id] = group;
            }}
            world={world}
            model={worldModels[index].scene}
            opacityRef={world.id === "designs" ? designsOpacityRef : undefined}
            boundsRef={world.id === "designs" ? designsBoundsRef : undefined}
            active={activeWorldId === world.id}
            resetViewToken={resetViewToken}
            inspectionControlsRef={inspectionControlsRef}
            onWorldEnter={onWorldEnter}
            onWorldLeave={onWorldLeave}
            onWorldActivate={onWorldActivate}
          />
        ))}
      </group>
    </>
  );
}

export function EcosystemOrbitCanvas(props: EcosystemOrbitCanvasProps) {
  const dpr: [number, number] = [1, props.quality === "full" ? 1.5 : 1.2];

  return (
    <Canvas
      className="wc-scene-orbit__canvas"
      camera={{ fov: 43, near: 0.1, far: 48, position: [0, 0.18, 12.8] }}
      dpr={dpr}
      frameloop="demand"
      gl={{
        alpha: true,
        antialias: props.quality === "full",
        failIfMajorPerformanceCaveat: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
      }}
      performance={{ min: 0.5 }}
      onPointerMissed={props.onDismiss}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.28;
        gl.setClearColor(ORBIT_PALETTE.canvas, 0);
      }}
    >
      <Suspense fallback={null}>
        <OrbitUniverse {...props} />
      </Suspense>
    </Canvas>
  );
}
