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

const VARIATION_D_WARM = [185 / 255, 87 / 255, 47 / 255] as const;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_accent;

out vec4 out_color;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += amp * noise(p);
    p = rot * p * 2.02;
    amp *= 0.5;
  }
  return v;
}

void main() {
  const float speed = 0.085;
  const float scale = 1.9;
  const float warp = 3.4;
  const float seamPosition = 0.6;
  const float seamGlow = 0.6;
  const float grain = 0.05;
  const vec3 base = vec3(0.0470588, 0.0470588, 0.0431373);
  const vec3 cold = vec3(0.192157, 0.356863, 0.490196);
  const vec3 hot = vec3(0.882353, 0.517647, 0.32549);

  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  vec2 p = vec2(uv.x * aspect, uv.y) * scale;
  float t = u_time * speed;

  vec2 q = vec2(
    fbm(p + vec2(0.0, t)),
    fbm(p + vec2(5.2, 1.3 - t * 0.7))
  );
  vec2 r = vec2(
    fbm(p + warp * q + vec2(1.7, 9.2) + t * 0.45),
    fbm(p + warp * q + vec2(8.3, 2.8) - t * 0.35)
  );
  float f = fbm(p + warp * r);

  float depth = smoothstep(0.15, 0.95, f);
  float heat = smoothstep(0.35, 1.05, r.x + f * 0.55);
  float cool = smoothstep(0.20, 0.85, r.y);

  vec3 color = base;
  color = mix(color, cold, cool * 0.72 * (1.0 - uv.y * 0.35));
  color = mix(color, u_accent, heat * 0.78 * smoothstep(0.05, 0.85, uv.x));
  color = mix(color, hot, pow(depth, 3.0) * 0.5);

  float seamY = seamPosition + 0.035 * sin(uv.x * 3.1 + t * 2.0) + 0.02 * (f - 0.5);
  float seam = exp(-pow((uv.y - seamY) * 34.0, 2.0));
  color += hot * seam * seamGlow * (0.35 + 0.65 * smoothstep(0.0, 0.6, uv.x));
  color += vec3(1.0) * exp(-pow((uv.y - seamY) * 190.0, 2.0)) * 0.18 * seamGlow;

  float vignette = smoothstep(
    1.35,
    0.25,
    length((uv - vec2(0.5)) * vec2(aspect, 1.0))
  );
  color *= mix(0.42, 1.0, vignette);

  float noiseGrain = hash(gl_FragCoord.xy + fract(u_time) * 91.7) - 0.5;
  color += noiseGrain * grain;
  color = max(color, base * 0.85);

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
    const timeLocation = gl.getUniformLocation(program, "u_time");
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

    const accent = [...readLiquidRuntime().accent] as [number, number, number];
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
      const targetAccent =
        document.documentElement.dataset.homeScene === "scene-01-5"
          ? liquidRuntime.accent
          : VARIATION_D_WARM;
      accent[0] += (targetAccent[0] - accent[0]) * 0.035;
      accent[1] += (targetAccent[1] - accent[1]) * 0.035;
      accent[2] += (targetAccent[2] - accent[2]) * 0.035;

      gl.useProgram(program);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, elapsed / 1000);
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
          homeScene === "scene-01-5" ||
          homeScene === "scene-02");

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
