/** @resolution */
uniform vec2 u_resolution;

/** @time */
uniform float u_time;

/**
 * @label Flow Speed
 * @range 0.0, 0.6
 * @default 0.09
 */
uniform float u_speed;

/**
 * @label Field Scale
 * @range 0.5, 5.0
 * @default 1.85
 */
uniform float u_scale;

/**
 * @label Warp Amount
 * @range 0.0, 6.0
 * @default 3.2
 */
uniform float u_warp;

/**
 * @label Base
 * @color
 * @default #0c0c0b
 */
uniform vec3 u_base;

/**
 * @label Cold
 * @color
 * @default #315b7d
 */
uniform vec3 u_cold;

/**
 * @label Warm
 * @color
 * @default #b9572f
 */
uniform vec3 u_warm;

/**
 * @label Highlight
 * @color
 * @default #e18453
 */
uniform vec3 u_hot;

/**
 * @label Seam Position
 * @range 0.0, 1.0
 * @default 0.62
 */
uniform float u_seam;

/**
 * @label Seam Glow
 * @range 0.0, 1.5
 * @default 0.65
 */
uniform float u_seamGlow;

/**
 * @label Grain
 * @range 0.0, 0.2
 * @default 0.045
 */
uniform float u_grain;

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
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  vec2 p = vec2(uv.x * aspect, uv.y) * u_scale;

  float t = u_time * u_speed;

  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3 - t * 0.7)));
  vec2 r = vec2(
    fbm(p + u_warp * q + vec2(1.7, 9.2) + t * 0.45),
    fbm(p + u_warp * q + vec2(8.3, 2.8) - t * 0.35)
  );
  float f = fbm(p + u_warp * r);

  float depth = smoothstep(0.15, 0.95, f);
  float heat = smoothstep(0.35, 1.05, r.x + f * 0.55);
  float cool = smoothstep(0.20, 0.85, r.y);

  vec3 col = u_base;
  col = mix(col, u_cold, cool * 0.72 * (1.0 - uv.y * 0.35));
  col = mix(col, u_warm, heat * 0.78 * smoothstep(0.05, 0.85, uv.x));
  col = mix(col, u_hot, pow(depth, 3.0) * 0.5);

  float seamY = u_seam + 0.035 * sin(uv.x * 3.1 + t * 2.0) + 0.02 * (f - 0.5);
  float seam = exp(-pow((uv.y - seamY) * 34.0, 2.0));
  col += u_hot * seam * u_seamGlow * (0.35 + 0.65 * smoothstep(0.0, 0.6, uv.x));
  col += vec3(1.0) * exp(-pow((uv.y - seamY) * 190.0, 2.0)) * 0.18 * u_seamGlow;

  float vig = smoothstep(1.35, 0.25, length((uv - vec2(0.5)) * vec2(aspect, 1.0)));
  col *= mix(0.42, 1.0, vig);

  float g = hash(gl_FragCoord.xy + fract(u_time) * 91.7) - 0.5;
  col += g * u_grain;

  col = max(col, u_base * 0.85);

  gl_FragColor = vec4(col, 1.0);
}
