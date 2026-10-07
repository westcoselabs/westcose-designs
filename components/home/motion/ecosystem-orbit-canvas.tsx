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
  ORBIT_CENTER_MODEL_SRC,
  ORBIT_WORLDS,
  getOrbitEditorialProgress,
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
  resetViewToken: number;
  progressRef: RefObject<number>;
  handoffProgressRef: RefObject<number>;
  motionActive: boolean;
  onWorldEnter: (worldId: OrbitWorldId) => void;
  onWorldLeave: () => void;
  onWorldActivate: (worldId: OrbitWorldId) => void;
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
  active: boolean;
  resetViewToken: number;
  inspectionControlsRef: RefObject<InspectionControls>;
  onWorldEnter: (worldId: OrbitWorldId) => void;
  onWorldLeave: () => void;
  onWorldActivate: (worldId: OrbitWorldId) => void;
};

const CENTER_MODEL_TARGET_SIZE = 0.96;
const INSPECTION_ZOOM_MIN = 0.85;
const INSPECTION_ZOOM_MAX = 1.35;
const DRAG_ROTATION_SPEED = 0.0075;
const ORBIT_COLLISION_MIN_DISTANCE = 2.72;
const ORBIT_COLLISION_PASSES = 3;

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
      <fogExp2 attach="fog" args={["#080b0a", 0.026]} />
    </>
  );
}

function NormalizedModel({
  model,
  rotation = [0, 0, 0],
  targetSize,
  envMapIntensity = 1.18,
  colorMultiplier = "#ffffff",
}: {
  model: THREE.Group;
  rotation?: readonly [number, number, number];
  targetSize: number;
  envMapIntensity?: number;
  colorMultiplier?: `#${string}`;
}) {
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
        }

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
      };
    }

    const scale = targetSize / largestDimension;
    const center = bounds.getCenter(new THREE.Vector3()).multiplyScalar(-scale);

    return {
      object,
      materials,
      position: center.toArray() as [number, number, number],
      scale,
    };
  }, [colorMultiplier, envMapIntensity, model, targetSize]);

  useEffect(
    () => () => {
      prepared.materials.forEach((material) => material.dispose());
    },
    [prepared],
  );

  return (
    <group rotation={[rotation[0], rotation[1], rotation[2]]}>
      <group position={prepared.position} scale={prepared.scale}>
        <primitive object={prepared.object} />
      </group>
    </group>
  );
}

function CentralMark({ model }: { model: THREE.Group }) {
  return <NormalizedModel model={model} targetSize={CENTER_MODEL_TARGET_SIZE} />;
}

function OrbitPath({
  world,
  quality,
  activeWorldId,
}: {
  world: OrbitWorld;
  quality: OrbitQualityTier;
  activeWorldId: OrbitWorldId | null;
}) {
  const lineRef = useRef<THREE.LineLoop>(null);
  const line = useMemo(() => {
    const segmentCount = quality === "full" ? 144 : 72;
    const points = Array.from({ length: segmentCount }, (_, index) =>
      getOrbitPoint(
        world,
        (index / segmentCount) * Math.PI * 2,
        new THREE.Vector3(),
      ),
    );
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: world.accent.primary,
      depthWrite: false,
      opacity: 0.16,
      transparent: true,
      toneMapped: false,
    });

    return new THREE.LineLoop(geometry, material);
  }, [quality, world]);

  useFrame((_, delta) => {
    const material = lineRef.current?.material as
      | THREE.LineBasicMaterial
      | undefined;

    if (!material) {
      return;
    }

    const targetOpacity = activeWorldId
      ? activeWorldId === world.id
        ? 0.24
        : 0.045
      : 0.15;

    material.opacity = THREE.MathUtils.damp(
      material.opacity,
      targetOpacity,
      5,
      delta,
    );
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

function DepthParticles({ quality }: { quality: OrbitQualityTier }) {
  const pointsRef = useRef<THREE.Points>(null);
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
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.0035;
      pointsRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.04) * 0.025;
    }
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#b9c9c0"
        depthWrite={false}
        opacity={quality === "full" ? 0.34 : 0.27}
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

function OrbitUniverse({
  hoveredWorldId,
  activeWorldId,
  quality,
  resetViewToken,
  progressRef,
  handoffProgressRef,
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
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();
  }, [
    activeWorldId,
    hoveredWorldId,
    invalidate,
    quality,
    resetViewToken,
  ]);

  useFrame((state, delta) => {
    const documentVisible = document.visibilityState !== "hidden";
    const editorialProgress = activeWorldId
      ? 0
      : getOrbitEditorialProgress(progressRef.current);
    const handoffMotionScale = activeWorldId
      ? 1
      : 1 - THREE.MathUtils.smoothstep(handoffProgressRef.current, 0, 1);

    if (
      motionActive &&
      documentVisible &&
      !activeWorldId &&
      !hoveredWorldId
    ) {
      orbitElapsedRef.current += Math.min(delta, 0.05) * handoffMotionScale;
    }

    const scrollPhase = getOrbitMotionProgress(progressRef.current) * 0.66;

    const hasActiveWorld = activeWorldId !== null;

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

            if (distance >= ORBIT_COLLISION_MIN_DISTANCE) {
              continue;
            }

            const safeDistance = Math.max(distance, 0.001);
            const push = (ORBIT_COLLISION_MIN_DISTANCE - safeDistance) * 0.5;
            const directionX = distance > 0.001 ? deltaX / safeDistance : 1;
            const directionY = distance > 0.001 ? deltaY / safeDistance : 0;

            first.x -= directionX * push;
            first.y -= directionY * push;
            second.x += directionX * push;
            second.y += directionY * push;
          }
        }
      }
    }

    ORBIT_WORLDS.forEach((world) => {
      const group = worldRefs.current[world.id];

      if (!group) {
        return;
      }

      const angle = orbitAnglesRef.current[world.id];
      const isActive = activeWorldId === world.id;
      const isHovered = hoveredWorldId === world.id;
      const orbitTarget = orbitTargetsRef.current[world.id];
      const targetScale = isActive
        ? world.presentation.focusScale * inspectionControlsRef.current.zoom
        : hasActiveWorld
          ? 0.58
          : isHovered
            ? 1.14
            : 1;

      group.position.x = THREE.MathUtils.damp(
        group.position.x,
        orbitTarget.x,
        isActive ? 6.8 : 4.3,
        delta,
      );
      group.position.y = THREE.MathUtils.damp(
        group.position.y,
        orbitTarget.y,
        isActive ? 6.8 : 4.3,
        delta,
      );
      group.position.z = THREE.MathUtils.damp(
        group.position.z,
        orbitTarget.z,
        isActive ? 7.4 : 4.9,
        delta,
      );
      group.scale.setScalar(
        THREE.MathUtils.damp(group.scale.x, targetScale, 7.2, delta),
      );
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
        activeWorldId
          ? 0
          : editorialProgress * (quality === "full" ? 3.75 : 0.65),
        5.4,
        delta,
      );
      universe.scale.setScalar(
        THREE.MathUtils.damp(
          universe.scale.x,
          activeWorldId
            ? 1
            : THREE.MathUtils.lerp(1, 0.88, editorialProgress),
          5.4,
          delta,
        ),
      );
    }

    if (center) {
      center.position.z = THREE.MathUtils.damp(
        center.position.z,
        activeWorldId ? -2 : 0,
        5.2,
        delta,
      );
      center.scale.setScalar(
        THREE.MathUtils.damp(
          center.scale.x,
          activeWorldId ? 0.52 : 1,
          5.2,
          delta,
        ),
      );
    }

    const pointerParallax = quality === "full" && !activeWorldId ? 1 : 0;
    const targetCameraX = state.pointer.x * 0.2 * pointerParallax;
    const targetCameraY =
      0.18 + state.pointer.y * 0.12 * pointerParallax + editorialProgress * 0.06;
    const targetCameraZ = activeWorldId
      ? 8.72
      : THREE.MathUtils.lerp(8.9, 11.4, editorialProgress);

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
      activeWorldId ? 0 : editorialProgress * 0.28,
      activeWorldId ? (quality === "compact" ? 0.28 : 0.02) : 0,
      activeWorldId ? 0.18 : -0.08,
    );
    state.camera.lookAt(cameraTargetRef.current);

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
      <ambientLight color="#d8e0da" intensity={0.72} />
      <hemisphereLight
        color="#eef4ef"
        groundColor="#151b18"
        intensity={1.9}
      />
      <directionalLight
        color="#fff1df"
        intensity={4.4}
        position={[4.8, 7.2, 6.5]}
      />
      <directionalLight
        color="#72a9d0"
        intensity={2.45}
        position={[-5.5, 2.2, 4.2]}
      />
      <directionalLight
        color="#d9e6d8"
        intensity={2.9}
        position={[0.6, -4.8, -3.5]}
      />
      <pointLight
        ref={focusLightRef}
        color="#a7c2aa"
        decay={1.7}
        distance={10}
        intensity={9}
        position={[1.8, 1.25, 3.7]}
      />
      <pointLight
        color="#e18453"
        decay={1.8}
        distance={9}
        intensity={7.5}
        position={[-3.2, -1.8, 4.1]}
      />

      <DepthParticles quality={quality} />

      <group ref={universeRef}>
        <group ref={centerRef}>
          <CentralMark model={centerModel.scene} />
        </group>

        {ORBIT_WORLDS.map((world) => (
          <OrbitPath
            key={`path-${world.id}`}
            world={world}
            quality={quality}
            activeWorldId={activeWorldId}
          />
        ))}

        {ORBIT_WORLDS.map((world, index) => (
          <OrbitWorldAnchor
            key={world.id}
            ref={(group) => {
              worldRefs.current[world.id] = group;
            }}
            world={world}
            model={worldModels[index].scene}
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
      camera={{ fov: 43, near: 0.1, far: 48, position: [0, 0.18, 8.9] }}
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
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.28;
        gl.setClearColor(0x080b0a, 0);
      }}
    >
      <Suspense fallback={null}>
        <OrbitUniverse {...props} />
      </Suspense>
    </Canvas>
  );
}
