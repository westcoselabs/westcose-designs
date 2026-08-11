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
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

import {
  ORBIT_WORLDS,
  getOrbitEditorialProgress,
  getOrbitMotionProgress,
  getOrbitWorld,
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
  designsTexture: THREE.Texture;
  shopTexture: THREE.Texture;
  onWorldEnter: (worldId: OrbitWorldId) => void;
  onWorldLeave: () => void;
  onWorldActivate: (worldId: OrbitWorldId) => void;
};

const ORBIT_RADIUS_X = 3.05;
const ORBIT_RADIUS_Y = 1.82;
const WORLD_COUNT = ORBIT_WORLDS.length;

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

function CentralMark() {
  const svg = useLoader(SVGLoader, "/brand/westcose-monogram.svg");
  const geometries = useMemo(() => {
    const nextGeometries = svg.paths.flatMap((path) =>
      path.toShapes(false).map(
        (shape) =>
          new THREE.ExtrudeGeometry(shape, {
            depth: 4,
            bevelEnabled: false,
            curveSegments: 12,
            steps: 1,
          }),
      ),
    );
    const bounds = new THREE.Box3();

    for (const geometry of nextGeometries) {
      geometry.computeBoundingBox();

      if (geometry.boundingBox) {
        bounds.union(geometry.boundingBox);
      }
    }

    const center = bounds.getCenter(new THREE.Vector3());

    for (const geometry of nextGeometries) {
      geometry.translate(-center.x, -center.y, -center.z);
      geometry.scale(0.0052, -0.0052, 0.0052);
      geometry.computeVertexNormals();
    }

    return nextGeometries;
  }, [svg]);

  useEffect(
    () => () => {
      for (const geometry of geometries) {
        geometry.dispose();
      }
    },
    [geometries],
  );

  return (
    <group scale={0.9}>
      {geometries.map((geometry, index) => (
        <mesh key={index} geometry={geometry}>
          <meshStandardMaterial
            color="#ece8dc"
            emissive="#1d211f"
            emissiveIntensity={0.12}
            metalness={0.18}
            roughness={0.46}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

function DesignsWorld({ texture }: { texture: THREE.Texture }) {
  return (
    <group rotation={[0.1, -0.24, -0.08]}>
      <mesh scale={[1.08, 0.88, 0.72]}>
        <icosahedronGeometry args={[0.82, 2]} />
        <meshStandardMaterial
          color="#26372f"
          flatShading
          metalness={0.08}
          roughness={0.88}
        />
      </mesh>
      <mesh position={[-0.18, 0.13, 0.72]} rotation={[-0.08, 0.08, -0.08]}>
        <planeGeometry args={[1.28, 0.84]} />
        <meshBasicMaterial
          map={texture}
          transparent
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0.5, -0.34, 0.58]} rotation={[0.04, -0.2, 0.16]}>
        <boxGeometry args={[0.62, 0.42, 0.035]} />
        <meshStandardMaterial color="#d9e6d8" roughness={0.72} />
      </mesh>
    </group>
  );
}

function LabsWorld() {
  return (
    <group rotation={[-0.08, 0.32, 0.04]}>
      <mesh>
        <boxGeometry args={[1.18, 1.18, 1.18, 5, 5, 5]} />
        <meshStandardMaterial
          color="#142b3c"
          emissive="#173d58"
          emissiveIntensity={0.36}
          metalness={0.52}
          roughness={0.45}
          wireframe
        />
      </mesh>
      {[-0.44, 0, 0.44].map((offset, index) => (
        <mesh
          key={offset}
          position={[offset, index === 1 ? 0.12 : -0.08, 0.7]}
          rotation={[0, 0, index === 1 ? 0 : offset * -0.16]}
        >
          <boxGeometry args={[0.58, index === 1 ? 0.66 : 0.46, 0.035]} />
          <meshStandardMaterial
            color={index === 1 ? "#c8dfef" : "#244d69"}
            emissive="#315b7d"
            emissiveIntensity={index === 1 ? 0.24 : 0.5}
            metalness={0.34}
            roughness={0.42}
          />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.735]}>
        <boxGeometry args={[0.34, 0.026, 0.015]} />
        <meshBasicMaterial color="#315b7d" toneMapped={false} />
      </mesh>
    </group>
  );
}

function ShopWorld({ texture }: { texture: THREE.Texture }) {
  return (
    <group rotation={[0.14, -0.16, 0.08]}>
      <mesh scale={[1.04, 0.72, 0.9]}>
        <dodecahedronGeometry args={[0.82, 1]} />
        <meshStandardMaterial
          color="#30251f"
          flatShading
          metalness={0.16}
          roughness={0.82}
        />
      </mesh>
      <mesh position={[0, 0.05, 0.82]} rotation={[0, 0, -0.04]}>
        <circleGeometry args={[0.55, 48]} />
        <meshBasicMaterial
          map={texture}
          transparent
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[-0.58, -0.4, 0.55]} rotation={[0.08, -0.12, -0.18]}>
        <boxGeometry args={[0.46, 0.62, 0.055]} />
        <meshStandardMaterial color="#e18453" roughness={0.76} />
      </mesh>
    </group>
  );
}

const OrbitWorldAnchor = forwardRef<THREE.Group, OrbitWorldAnchorProps>(
  function OrbitWorldAnchor(
    {
      world,
      index,
      designsTexture,
      shopTexture,
      onWorldEnter,
      onWorldLeave,
      onWorldActivate,
    },
    ref,
  ) {
    const position = initialWorldPosition(index);

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
        {world.visual === "identity" ? (
          <DesignsWorld texture={designsTexture} />
        ) : null}
        {world.visual === "interface" ? <LabsWorld /> : null}
        {world.visual === "goods" ? <ShopWorld texture={shopTexture} /> : null}

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
  const designsWorld = getOrbitWorld("designs");
  const shopWorld = getOrbitWorld("shop");
  const designsTextureSrc =
    "textureSrc" in designsWorld ? designsWorld.textureSrc : "";
  const shopTextureSrc = "textureSrc" in shopWorld ? shopWorld.textureSrc : "";
  const [designsTexture, shopTexture] = useLoader(THREE.TextureLoader, [
    designsTextureSrc,
    shopTextureSrc,
  ]);
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
    for (const texture of [designsTexture, shopTexture]) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      texture.needsUpdate = true;
    }
  }, [designsTexture, shopTexture]);

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
      <ambientLight intensity={0.7} />
      <directionalLight color="#ece8dc" intensity={1.3} position={[2, 4, 5]} />
      <pointLight
        ref={focusLightRef}
        color="#72a9d0"
        intensity={6}
        distance={6}
        position={[1.8, 1.4, 2.8]}
      />

      <group ref={universeRef}>
        <CentralMark />
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
            designsTexture={designsTexture}
            shopTexture={shopTexture}
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
