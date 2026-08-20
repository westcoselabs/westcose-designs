"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  Suspense,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import {
  ORBIT_CENTER_MODEL_SRC,
  ORBIT_WORLDS,
  getOrbitEditorialProgress,
  getOrbitMotionProgress,
  type OrbitWorld,
  type OrbitWorldId,
} from "@/lib/home/orbit-worlds";

type EcosystemOrbitCanvasProps = {
  selectedWorldId: OrbitWorldId | null;
  progressRef: RefObject<number>;
  handoffProgressRef: RefObject<number>;
  motionActive: boolean;
  onWorldEnter: (worldId: OrbitWorldId) => void;
  onWorldLeave: () => void;
  onWorldActivate: (worldId: OrbitWorldId) => void;
  onReady: () => void;
  onFailure: () => void;
};

type OrbitWorldAnchorProps = {
  world: OrbitWorld;
  index: number;
  model: THREE.Group;
  onWorldEnter: (worldId: OrbitWorldId) => void;
  onWorldLeave: () => void;
  onWorldActivate: (worldId: OrbitWorldId) => void;
};

type ModelPresentation = {
  targetSize: number;
  rotation: [number, number, number];
};

const ORBIT_RADIUS_X = 3.05;
const ORBIT_RADIUS_Y = 1.82;
const WORLD_COUNT = ORBIT_WORLDS.length;
const CENTER_MODEL_TARGET_SIZE = 0.92;
const ORBIT_MODEL_SOURCES = [
  ORBIT_CENTER_MODEL_SRC,
  ...ORBIT_WORLDS.map((world) => world.modelSrc),
];
const WORLD_MODEL_PRESENTATION: Record<OrbitWorldId, ModelPresentation> = {
  designs: {
    targetSize: 1.78,
    rotation: [0.08, -0.24, -0.06],
  },
  labs: {
    targetSize: 1.88,
    rotation: [-0.04, 0.3, 0.025],
  },
  shop: {
    targetSize: 1.82,
    rotation: [0.06, -0.2, 0.045],
  },
};

function initialWorldPosition(index: number): [number, number, number] {
  const angle = (index / WORLD_COUNT) * Math.PI * 2 + Math.PI * 0.12;

  return [
    Math.cos(angle) * ORBIT_RADIUS_X,
    Math.sin(angle) * ORBIT_RADIUS_Y,
    Math.sin(angle + Math.PI * 0.4) * 0.42,
  ];
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

    canvas.addEventListener("webglcontextlost", handleContextLost);
    canvas.addEventListener("webglcontextrestored", handleContextRestored);
    onReady();
    invalidate();

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
    };
  }, [gl, invalidate, onFailure, onReady]);

  useEffect(() => {
    if (motionActive) {
      invalidate();
    }
  }, [invalidate, motionActive]);

  return null;
}

function NormalizedModel({
  model,
  rotation = [0, 0, 0],
  targetSize,
}: {
  model: THREE.Group;
  rotation?: [number, number, number];
  targetSize: number;
}) {
  const prepared = useMemo(() => {
    const object = model.clone(true);
    object.updateMatrixWorld(true);

    const bounds = new THREE.Box3().setFromObject(object, true);
    const size = bounds.getSize(new THREE.Vector3());
    const largestDimension = Math.max(size.x, size.y, size.z);

    if (bounds.isEmpty() || largestDimension <= Number.EPSILON) {
      return {
        object,
        position: [0, 0, 0] as [number, number, number],
        scale: 1,
      };
    }

    const scale = targetSize / largestDimension;
    const center = bounds.getCenter(new THREE.Vector3()).multiplyScalar(-scale);

    return {
      object,
      position: center.toArray() as [number, number, number],
      scale,
    };
  }, [model, targetSize]);

  return (
    <group rotation={rotation}>
      <group position={prepared.position} scale={prepared.scale}>
        <primitive object={prepared.object} />
      </group>
    </group>
  );
}

function CentralMark({ model }: { model: THREE.Group }) {
  return <NormalizedModel model={model} targetSize={CENTER_MODEL_TARGET_SIZE} />;
}

const OrbitWorldAnchor = forwardRef<THREE.Group, OrbitWorldAnchorProps>(
  function OrbitWorldAnchor(
    {
      world,
      index,
      model,
      onWorldEnter,
      onWorldLeave,
      onWorldActivate,
    },
    ref,
  ) {
    const position = initialWorldPosition(index);
    const presentation = WORLD_MODEL_PRESENTATION[world.id];

    return (
      <group
        ref={ref}
        position={position}
        onPointerOver={(event) => {
          event.stopPropagation();
          onWorldEnter(world.id);
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          onWorldLeave();
        }}
        onClick={(event) => {
          event.stopPropagation();
          onWorldActivate(world.id);
        }}
      >
        <NormalizedModel
          model={model}
          rotation={presentation.rotation}
          targetSize={presentation.targetSize}
        />

        <mesh>
          <sphereGeometry args={[1.34, 14, 14]} />
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
  selectedWorldId,
  progressRef,
  handoffProgressRef,
  motionActive,
  onWorldEnter,
  onWorldLeave,
  onWorldActivate,
  onReady,
  onFailure,
}: EcosystemOrbitCanvasProps) {
  const [centerModel, ...worldModels] = useLoader(
    GLTFLoader,
    ORBIT_MODEL_SOURCES,
  );
  const worldRefs = useRef<Record<OrbitWorldId, THREE.Group | null>>({
    designs: null,
    labs: null,
    shop: null,
  });
  const orbitPhaseRef = useRef(0);
  const universeRef = useRef<THREE.Group>(null);
  const focusLightRef = useRef<THREE.PointLight>(null);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();
  }, [invalidate, selectedWorldId]);

  useFrame((state, delta) => {
    const editorialProgress = getOrbitEditorialProgress(progressRef.current);
    const handoffMotionScale =
      1 - THREE.MathUtils.smoothstep(handoffProgressRef.current, 0, 1);

    if (motionActive) {
      orbitPhaseRef.current +=
        Math.min(delta, 0.05) *
        (selectedWorldId ? 0.032 : 0.09) *
        handoffMotionScale;
    }

    const scrollPhase = getOrbitMotionProgress(progressRef.current) * 0.62;
    const phase = orbitPhaseRef.current + scrollPhase;

    ORBIT_WORLDS.forEach((world, index) => {
      const group = worldRefs.current[world.id];

      if (!group) {
        return;
      }

      const angle =
        phase + (index / WORLD_COUNT) * Math.PI * 2 + Math.PI * 0.12;
      const isSelected = selectedWorldId === world.id;
      const hasSelection = selectedWorldId !== null;
      const targetScale = isSelected ? 1.16 : hasSelection ? 0.84 : 1;
      const targetX = Math.cos(angle) * ORBIT_RADIUS_X;
      const targetY =
        Math.sin(angle) * ORBIT_RADIUS_Y + Math.sin(phase * 1.7 + index) * 0.08;
      const targetZ =
        Math.sin(angle + Math.PI * 0.4) * 0.42 +
        (isSelected ? 0.58 : hasSelection ? -0.22 : 0);

      group.position.x = THREE.MathUtils.damp(
        group.position.x,
        targetX,
        4.2,
        delta,
      );
      group.position.y = THREE.MathUtils.damp(
        group.position.y,
        targetY,
        4.2,
        delta,
      );
      group.position.z = THREE.MathUtils.damp(
        group.position.z,
        targetZ,
        4.8,
        delta,
      );
      group.scale.setScalar(
        THREE.MathUtils.damp(group.scale.x, targetScale, 5.4, delta),
      );
      group.rotation.y += motionActive ? delta * 0.055 * handoffMotionScale : 0;
      group.rotation.z = THREE.MathUtils.damp(
        group.rotation.z,
        Math.sin(phase + index) * 0.045,
        3.2,
        delta,
      );
    });

    const focusLight = focusLightRef.current;
    const universe = universeRef.current;
    const selectedGroup = selectedWorldId
      ? worldRefs.current[selectedWorldId]
      : null;

    if (universe) {
      universe.position.x = THREE.MathUtils.damp(
        universe.position.x,
        editorialProgress * 4.2,
        5.2,
        delta,
      );
      universe.scale.setScalar(
        THREE.MathUtils.damp(
          universe.scale.x,
          THREE.MathUtils.lerp(1, 0.94, editorialProgress),
          5.2,
          delta,
        ),
      );
    }

    state.camera.position.z = THREE.MathUtils.damp(
      state.camera.position.z,
      THREE.MathUtils.lerp(8.55, 11.35, editorialProgress),
      5.2,
      delta,
    );

    if (focusLight) {
      focusLight.position.x = THREE.MathUtils.damp(
        focusLight.position.x,
        (selectedGroup?.position.x ?? 1.8) + editorialProgress * 4.2,
        3.4,
        delta,
      );
      focusLight.position.y = THREE.MathUtils.damp(
        focusLight.position.y,
        selectedGroup?.position.y ?? 1.4,
        3.4,
        delta,
      );
    }

    if (motionActive) {
      state.invalidate();
    }
  });

  return (
    <>
      <RendererLifecycle
        motionActive={motionActive}
        onFailure={onFailure}
        onReady={onReady}
      />
      <ambientLight intensity={0.48} />
      <hemisphereLight
        color="#dce7e1"
        groundColor="#070908"
        intensity={1.1}
      />
      <directionalLight
        color="#fff0df"
        intensity={2.15}
        position={[4.5, 6.5, 6]}
      />
      <directionalLight
        color="#5f98c1"
        intensity={1.3}
        position={[-5, 1.5, 3]}
      />
      <pointLight
        ref={focusLightRef}
        color="#72a9d0"
        intensity={7}
        distance={8}
        position={[1.8, 1.4, 2.8]}
      />
      <pointLight
        color="#e18453"
        intensity={3.2}
        distance={7}
        position={[-2.6, -1.4, 3.4]}
      />

      <group ref={universeRef}>
        <CentralMark model={centerModel.scene} />
        {[2.16, 2.84, 3.55].map((radius, index) => (
          <mesh key={radius} rotation={[0, 0, index * 0.08]}>
            <torusGeometry args={[radius, 0.006, 5, 128]} />
            <meshBasicMaterial
              color={index === 1 ? "#5d6b65" : "#353b38"}
              opacity={index === 1 ? 0.55 : 0.34}
              transparent
              toneMapped={false}
            />
          </mesh>
        ))}

        {ORBIT_WORLDS.map((world, index) => (
          <OrbitWorldAnchor
            key={world.id}
            ref={(group) => {
              worldRefs.current[world.id] = group;
            }}
            world={world}
            index={index}
            model={worldModels[index].scene}
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
  return (
    <Canvas
      className="wc-scene-orbit__canvas"
      camera={{ fov: 43, near: 0.1, far: 40, position: [0, 0, 8.5] }}
      dpr={[1, 1.5]}
      frameloop="demand"
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
      }}
      performance={{ min: 0.55 }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <Suspense fallback={null}>
        <OrbitUniverse {...props} />
      </Suspense>
    </Canvas>
  );
}
