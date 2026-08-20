"use client";

import { Canvas, useLoader } from "@react-three/fiber";
import { Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const PEN_MODEL_SRC = "/experience/pen/westcose_designs.glb";

function PenAsset({ onReady }: { onReady: () => void }) {
  const gltf = useLoader(GLTFLoader, PEN_MODEL_SRC);
  const normalized = useMemo(() => {
    const object = gltf.scene.clone(true);
    const bounds = new THREE.Box3().setFromObject(object);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const scale = 1.9 / Math.max(size.x, size.y, size.z, 0.001);

    return { object, center, scale };
  }, [gltf.scene]);

  useEffect(() => {
    onReady();
  }, [onReady]);

  return (
    <group
      scale={normalized.scale}
      rotation={[0.16, -0.52, -0.08]}
    >
      <primitive
        object={normalized.object}
        position={[
          -normalized.center.x,
          -normalized.center.y,
          -normalized.center.z,
        ]}
      />
    </group>
  );
}

export function CorporatePenModel({ onReady }: { onReady: () => void }) {
  return (
    <Canvas
      className="wc-refined-corporate__pen-canvas"
      camera={{ fov: 38, near: 0.1, far: 20, position: [0, 0, 4.25] }}
      dpr={[1, 1.35]}
      frameloop="demand"
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
      }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={1.25} />
        <hemisphereLight args={["#ece8dc", "#1d211f", 1.7]} />
        <directionalLight
          color="#ffffff"
          intensity={2.4}
          position={[3, 4, 5]}
        />
        <directionalLight
          color="#e18453"
          intensity={1.1}
          position={[-3, -1, 2]}
        />
        <PenAsset onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
