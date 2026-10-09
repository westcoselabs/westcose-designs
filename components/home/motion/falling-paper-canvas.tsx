"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { CINEMATIC_PAPERS, type CinematicPaper } from "@/lib/home/falling-studio-manifest";
import { clamp01, mix, phase, type PaperFrame } from "@/lib/home/cinematic-motion";

type Props = { frame: RefObject<PaperFrame>; onReady: () => void; onFailure: () => void; onInvalidate: (draw?: () => void) => void };

function Paper({ art, texture, frame }: { art: CinematicPaper; texture: THREE.Texture; frame: RefObject<PaperFrame> }) {
  const group = useRef<THREE.Group>(null);
  const surface = useRef<THREE.Mesh<THREE.PlaneGeometry>>(null);
  const front = useRef<THREE.MeshLambertMaterial>(null);
  const back = useRef<THREE.MeshLambertMaterial>(null);
  const flatLight = useRef({ value: 0 });
  const { viewport } = useThree();
  const ratio = art.height / art.width;
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, ratio, 24, 32), [ratio]);
  const base = useMemo(() => Float32Array.from(geometry.attributes.position.array), [geometry]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(() => {
    const node = group.current;
    if (!node) return;
    const state = frame.current;
    const p = state.progress;
    const final = art.id === "vested-handoff";
    const visible = state.active && (!state.mobile || art.mobile) && p >= art.progress[0] && (p < art.progress[1] || final);
    node.visible = visible;
    if (!visible) return;
    const t = clamp01((p - art.progress[0]) / (art.progress[1] - art.progress[0]));
    const s = art.paper.seed;
    let x = mix(art.path[0][0], art.path[1][0], t) + Math.sin(t * Math.PI * 1.5 + s) * .11;
    let y = mix(art.path[0][1], art.path[1][1], t);
    let z = mix(art.path[0][2], art.path[1][2], t);
    let width = art.paper.width * (state.mobile ? 1.65 : 1);
    let bend = art.paper.bend;
    let rx = Math.sin(t * Math.PI * 2 + s) * .38;
    let ry = Math.sin(t * Math.PI * 2.3 + s) * .5 + phase(t, .66, .91) * 1.8;
    let rz = Math.sin(t * Math.PI + s) * .2;
    let opacity = phase(t, 0, .09) * (1 - phase(t, .88, 1));
    if (art.id === "sunshine-entry") {
      opacity = phase(state.entry, .04, .1) * (1 - phase(t, .88, 1));
      if (p === 0) {
        const peel = phase(state.entry, .04, 1);
        x = mix(state.entryRect.x, state.mobile ? .5 : .42, peel);
        y = mix(state.entryRect.y, .35, peel);
        z = mix(0, -1.5, peel);
        width = mix(state.entryRect.width, width, peel);
        bend *= Math.sin(peel * Math.PI) * .8 + peel;
        rx = Math.sin(peel * Math.PI) * -.4;
        ry = Math.sin(peel * Math.PI) * .3;
        rz = Math.sin(peel * Math.PI) * -.14;
      }
    }
    if (final) {
      const arrival = phase(p, .78, .88);
      const close = phase(state.handoff, 0, .3);
      const settle = phase(state.handoff, .3, .97);
      flatLight.current.value = phase(settle, .7, 1);
      x = mix(mix(.76, .5, arrival), state.receiver.x, settle);
      y = mix(mix(-.3, .5, arrival), state.receiver.y, settle);
      z = 0;
      width = mix(mix(.37, 1.12, close), state.receiver.width, settle);
      bend *= (1 - settle);
      rx = mix(.32 * (1 - close), 0, settle);
      ry = mix(-.25 * (1 - close), 0, settle);
      rz = -.12 * (1 - close) * (1 - settle);
      opacity = phase(p, .78, .82) * (1 - phase(state.handoff, .97, 1));
    }
    node.position.set((x - .5) * viewport.width, (.5 - y) * viewport.height, z);
    node.rotation.set(rx, ry, rz);
    node.scale.setScalar(width * viewport.width);
    if (front.current) front.current.opacity = opacity;
    if (back.current) back.current.opacity = opacity;
    const activeGeometry = surface.current?.geometry;
    if (!activeGeometry) return;
    const positions = activeGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const bx = base[i * 3], by = base[i * 3 + 1];
      const edge = Math.pow(Math.abs(bx) * 2, 2.5);
      const curl = Math.sin(bx * 3.4 + t * 3 + s) * bend;
      const flutter = Math.sin(by * 7 + t * 9 + s) * art.paper.flutter * edge * (final ? 1 - phase(state.handoff, .3, .97) : 1);
      positions.setZ(i, curl + flutter + edge * bend * .35);
    }
    positions.needsUpdate = true;
    activeGeometry.computeVertexNormals();
  });

  return <group ref={group} visible={false}>
    <mesh ref={surface} geometry={geometry} castShadow receiveShadow>
      <meshLambertMaterial ref={front} map={texture} transparent depthWrite={false} side={THREE.FrontSide} color="#fff9ef"
        onBeforeCompile={(shader) => {
          shader.uniforms.uPaperFlat = flatLight.current;
          shader.fragmentShader = "uniform float uPaperFlat;\n" + shader.fragmentShader;
          shader.fragmentShader = shader.fragmentShader.replace("#include <map_fragment>", `#include <map_fragment>
            float edge = min(min(vMapUv.x, 1.0-vMapUv.x), min(vMapUv.y, 1.0-vMapUv.y));
            float grain = fract(sin(dot(vMapUv * 1200.0, vec2(12.9898,78.233))) * 43758.5453);
            diffuseColor.rgb = mix(vec3(.91,.88,.8), diffuseColor.rgb, smoothstep(.005,.008,edge));
            diffuseColor.rgb *= .98 + grain * .025;
          `);
          // Resolve to the exact, unlit source pixels before the DOM takes over.
          shader.fragmentShader = shader.fragmentShader.replace("#include <tonemapping_fragment>", `#include <tonemapping_fragment>
            gl_FragColor.rgb = mix(gl_FragColor.rgb, texture2D(map, vMapUv).rgb, uPaperFlat);
          `);
        }} />
      <mesh geometry={geometry} position-z={-.0015}>
        <meshLambertMaterial ref={back} color="#dcd3c0" transparent depthWrite={false} side={THREE.BackSide} />
      </mesh>
    </mesh>
  </group>;
}

function Papers({ frame, onReady, onInvalidate }: Omit<Props, "onFailure">) {
  const textures = useLoader(THREE.TextureLoader, CINEMATIC_PAPERS.map(art => art.src));
  const { invalidate } = useThree();
  useEffect(() => {
    textures.forEach(texture => { texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4; });
    onInvalidate(invalidate);
    onReady(); invalidate();
    return () => { onInvalidate(undefined); };
  }, [textures, invalidate, onReady, onInvalidate]);
  return <>
    <ambientLight intensity={1.7} color="#fff4dd" />
    <directionalLight position={[-4, 5, 7]} intensity={2.1} color="#ffe2b6" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7} shadow-bias={-.0005} shadow-normalBias={.025} />
    <directionalLight position={[4, -2, 3]} intensity={.7} color="#91b9c5" />
    {CINEMATIC_PAPERS.map((art, i) => <Paper key={art.id} art={art} texture={textures[i]} frame={frame} />)}
  </>;
}

function ContextGuard({ onFailure }: { onFailure: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const lost = (event: Event) => { event.preventDefault(); onFailure(); };
    gl.domElement.addEventListener("webglcontextlost", lost);
    return () => gl.domElement.removeEventListener("webglcontextlost", lost);
  }, [gl, onFailure]);
  return null;
}

export default function FallingPaperCanvas({ frame, onReady, onFailure, onInvalidate }: Props) {
  const [software, setSoftware] = useState(false);
  return <Canvas frameloop="demand" shadows={!frame.current.mobile && !software} dpr={software ? .85 : [1, frame.current.mobile ? 1.25 : 1.5]} camera={{ position: [0, 0, 10], fov: 35, near: .1, far: 40 }}
    gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
    onCreated={({ gl }) => {
      const context = gl.getContext();
      const debug = context.getExtension("WEBGL_debug_renderer_info");
      const renderer = debug ? String(context.getParameter(debug.UNMASKED_RENDERER_WEBGL)) : "";
      // Software rasterizers keep the same composition with a smaller pixel budget.
      setSoftware(/swiftshader|llvmpipe|software/i.test(renderer));
    }}>
    <ContextGuard onFailure={onFailure} />
    <Suspense fallback={null}><Papers frame={frame} onReady={onReady} onInvalidate={onInvalidate} /></Suspense>
  </Canvas>;
}
