"use client";

import { Glass } from "@samasante/liquid-glass";

// One optical surface behind the navigation; labels and links stay unfiltered.
// Chromium gets live refraction; other browsers get the package's frosted glass.
// CSS supplies opaque accessibility and unsupported-browser fallbacks.
export function NavigationGlass() {
  return (
    <div className="wc-liquid-header__material" aria-hidden="true">
      <Glass
        className="wc-liquid-header__lens"
        optics={{
          strength: 0.12,
          depth: 0.55,
          curvature: 0.22,
          dispersion: 0.08,
          bend: 0.65,
          bendWidth: 0.22,
          frost: 6,
          sheen: 0.65,
          specular: 0.8,
        }}
      >
        <span />
      </Glass>
    </div>
  );
}
