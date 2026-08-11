"use client";

import { useEffect, useRef, useState } from "react";

import { useHomeExperience } from "@/lib/home/home-experience-context";
import { gsap } from "@/lib/motion/gsap";
import { useReducedMotionPreference } from "@/lib/motion/use-reduced-motion";

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_time;
uniform float u_energy;
uniform float u_pointer_strength;
uniform vec3 u_accent;

in vec2 v_uv;
out vec4 out_color;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + 1.0), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.52;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p = mat2(1.62, 1.18, -1.18, 1.62) * p + 0.19;
    amplitude *= 0.48;
  }
  return value;
}

void main() {
  vec2 aspect = vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0);
  vec2 uv = (v_uv - 0.5) * aspect;
  vec2 pointer = (u_pointer - 0.5) * aspect;
  vec2 pointer_delta = uv - pointer;
  float distance_to_pointer = length(vec2(pointer_delta.x * 0.46, pointer_delta.y * 1.28));
  float pointer_field = exp(-distance_to_pointer * 6.5) * u_pointer_strength;

  float slow_time = u_time * (0.055 + u_energy * 0.035);
  vec2 domain = uv * 1.45;
  domain.x *= 1.0 + u_energy * 0.72;
  domain.x -= slow_time * (1.8 + u_energy * 4.2);
  domain.y += sin(uv.x * 3.2 - slow_time * 4.0) * (0.04 + u_energy * 0.08);
  float first_warp = fbm(domain + vec2(slow_time * 2.2, -slow_time * 0.54));
  float second_warp = fbm(
    domain * 1.62 + vec2(-slow_time * 1.4, slow_time * 0.72) + first_warp * 1.85
  );
  float liquid = smoothstep(0.18, 0.92, first_warp * 0.58 + second_warp * 0.72);
  float refraction = sin((distance_to_pointer - pointer_field * 0.25) * 32.0 - u_time * 0.7);
  liquid += refraction * pointer_field * 0.16;

  vec3 ink = vec3(0.018, 0.019, 0.018);
  vec3 cold = vec3(0.055, 0.12, 0.17);
  vec3 color = mix(ink, cold, smoothstep(0.22, 0.86, liquid) * 0.68);
  color = mix(color, u_accent, smoothstep(0.56, 1.02, liquid) * (0.24 + u_energy * 0.2));
  color += vec3(0.18, 0.16, 0.12) * pointer_field * 0.2;

  float vignette = smoothstep(1.02, 0.22, length(uv));
  color *= 0.52 + vignette * 0.62;
  color += (hash(gl_FragCoord.xy + u_time) - 0.5) / 255.0;
  out_color = vec4(color, 1.0);
}`;

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);

  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export function HomeLiquidBackdrop() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [contextVersion, setContextVersion] = useState(0);
  const prefersReducedMotion = useReducedMotionPreference();
  const { readLiquidRuntime, reportHeroVisualReady } = useHomeExperience();

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;

    const setRendererMode = (mode: "fallback" | "webgl") => {
      if (root) root.dataset.renderer = mode;
    };

    if (!canvas) {
      reportHeroVisualReady();
      return;
    }

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const coarsePointerQuery = window.matchMedia(
      "(hover: none), (pointer: coarse), (max-width: 47.999rem)",
    );

    if (
      prefersReducedMotion ||
      reducedMotionQuery.matches ||
      coarsePointerQuery.matches
    ) {
      setRendererMode("fallback");
      reportHeroVisualReady();
      return;
    }

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
      stencil: false,
    });

    if (!gl) {
      setRendererMode("fallback");
      reportHeroVisualReady();
      return;
    }

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      FRAGMENT_SHADER,
    );

    if (!vertexShader || !fragmentShader) {
      if (vertexShader) gl.deleteShader(vertexShader);
      if (fragmentShader) gl.deleteShader(fragmentShader);
      setRendererMode("fallback");
      reportHeroVisualReady();
      return;
    }

    const program = gl.createProgram();

    if (!program) {
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      setRendererMode("fallback");
      reportHeroVisualReady();
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      setRendererMode("fallback");
      reportHeroVisualReady();
      return;
    }

    const buffer = gl.createBuffer();
    const positionLocation = gl.getAttribLocation(program, "a_position");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const pointerLocation = gl.getUniformLocation(program, "u_pointer");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const energyLocation = gl.getUniformLocation(program, "u_energy");
    const pointerStrengthLocation = gl.getUniformLocation(
      program,
      "u_pointer_strength",
    );
    const accentLocation = gl.getUniformLocation(program, "u_accent");

    if (!buffer || positionLocation < 0) {
      if (buffer) gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      setRendererMode("fallback");
      reportHeroVisualReady();
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const pointer = { x: 0.67, y: 0.38, targetX: 0.67, targetY: 0.38 };
    const accent = [...readLiquidRuntime().accent] as [number, number, number];
    let pointerStrength = 0;
    let targetPointerStrength = 0;
    let tickerAttached = false;
    let lastTickerTime: number | null = null;
    let shaderElapsed = 0;
    let contextLost = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const draw = (elapsed: number) => {
      if (contextLost) {
        return;
      }

      const liquidRuntime = readLiquidRuntime();
      pointer.x += (pointer.targetX - pointer.x) * 0.075;
      pointer.y += (pointer.targetY - pointer.y) * 0.075;
      pointerStrength += (targetPointerStrength - pointerStrength) * 0.07;
      accent[0] += (liquidRuntime.accent[0] - accent[0]) * 0.035;
      accent[1] += (liquidRuntime.accent[1] - accent[1]) * 0.035;
      accent[2] += (liquidRuntime.accent[2] - accent[2]) * 0.035;

      gl.useProgram(program);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform2f(pointerLocation, pointer.x, pointer.y);
      gl.uniform1f(timeLocation, elapsed / 1000);
      gl.uniform1f(energyLocation, liquidRuntime.energy);
      gl.uniform1f(pointerStrengthLocation, pointerStrength);
      gl.uniform3f(accentLocation, accent[0], accent[1], accent[2]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const frame = (time: number) => {
      const tickerTime = time * 1000;

      if (lastTickerTime !== null) {
        shaderElapsed += Math.min(tickerTime - lastTickerTime, 100);
      }

      lastTickerTime = tickerTime;
      draw(shaderElapsed);
    };

    const syncActivity = () => {
      const homeScene = document.documentElement.dataset.homeScene;
      const openingPending =
        document.documentElement.dataset.homeOpening !== "complete";
      const shouldAnimate =
        !document.hidden &&
        !contextLost &&
        (openingPending ||
          homeScene === "scene-01" ||
          homeScene === "scene-01-5");

      if (root) root.dataset.rafActive = String(shouldAnimate);

      if (shouldAnimate && !tickerAttached) {
        lastTickerTime = null;
        gsap.ticker.add(frame);
        tickerAttached = true;
      } else if (!shouldAnimate && tickerAttached) {
        gsap.ticker.remove(frame);
        tickerAttached = false;
        lastTickerTime = null;
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointer.targetX = event.clientX / Math.max(window.innerWidth, 1);
      pointer.targetY = 1 - event.clientY / Math.max(window.innerHeight, 1);
      targetPointerStrength = 1;
    };

    const handlePointerLeave = () => {
      targetPointerStrength = 0;
    };

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;

      if (tickerAttached) {
        gsap.ticker.remove(frame);
        tickerAttached = false;
        lastTickerTime = null;
      }

      if (root) root.dataset.rafActive = "false";
      setRendererMode("fallback");
      reportHeroVisualReady();
    };

    const handleContextRestored = () => {
      contextLost = false;
      setContextVersion((version) => version + 1);
    };

    resize();
    draw(shaderElapsed);
    setRendererMode("webgl");
    reportHeroVisualReady();

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw(shaderElapsed);
    });
    const attributeObserver = new MutationObserver(syncActivity);

    resizeObserver.observe(canvas);
    attributeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-home-opening", "data-home-scene"],
    });
    document.addEventListener("visibilitychange", syncActivity);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener(
      "pointerleave",
      handlePointerLeave,
    );
    canvas.addEventListener("webglcontextlost", handleContextLost);
    canvas.addEventListener("webglcontextrestored", handleContextRestored);
    syncActivity();

    return () => {
      if (tickerAttached) {
        gsap.ticker.remove(frame);
        tickerAttached = false;
      }

      resizeObserver.disconnect();
      attributeObserver.disconnect();
      document.removeEventListener("visibilitychange", syncActivity);
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      if (root) root.dataset.rafActive = "false";
    };
  }, [
    contextVersion,
    prefersReducedMotion,
    readLiquidRuntime,
    reportHeroVisualReady,
  ]);

  return (
    <div
      ref={rootRef}
      className="wc-liquid-backdrop"
      data-renderer="fallback"
      data-raf-active="false"
      aria-hidden="true"
    >
      <div className="wc-liquid-backdrop__fallback" />
      <canvas ref={canvasRef} className="wc-liquid-backdrop__canvas" />
    </div>
  );
}
