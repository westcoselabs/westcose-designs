# WestCose Designs

Phase 11.5 is a retroactive homepage refinement, motion-stabilization, and narrative pass applied after the completed Phase 11 Orbit and Phase 12 Project Brief work. Scene 03 now communicates Brand Development / Identity Systems through truthful approved portfolio proof rather than user-facing Greenfield placeholders. Greenfield remains a future flagship case study and approved proof source when genuine project assets are supplied; the completed Scene 07 form is preserved.

## Requirements

- Node.js 20.9 or newer
- Corepack (uses the pinned npm 10.9.3 release)

## Local development

```bash
corepack npm ci
corepack npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
corepack npm run lint
corepack npm run typecheck
corepack npm run build
```

## Architecture boundaries

- Next.js App Router and React Server Components are the default.
- Client Components are reserved for behavior that requires the browser.
- Global tokens follow a primitive, semantic, and component-contract hierarchy.
- The shared navigation, footer, controls, glass material, containers, and editorial grid are Phase 1 foundations.
- The homepage renders all nine approved scenes as semantic server HTML in the locked narrative order.
- One shared client controller owns opening readiness, scene detection, normalized progress, reduced-motion detection, navigation state, and mutable shader controls without per-frame React state.
- One global Lenis instance is synchronized with the GSAP ticker. Scene-local ScrollTriggers scrub motion while CSS sticky stages remain the only pin owner.
- Scene 00 is a fixed, readiness-driven overlay with an immediate bypass and the isolated WestCose monogram carrying the mask handoff into the accessible Scene 01 hero.
- Scene 01 uses a capped, pausable raw WebGL2 liquid backdrop with static mobile, reduced-motion, and context-loss fallbacks.
- Scene 01.5 uses four optimized derivatives from the protected `illustrations` sources, a typed manifest, measured right-to-left travel, responsive horizontal motion, and a normal-flow reduced-motion gallery.
- Illustration 04 is the bridge object into Scene 02. Scene 02 maps its sticky-scene progress to the supplied paused video, with poster/loading/stall/error states and no independent autoplay.
- Scene 02 retains the placeholder video as a background environment while deterministic project artwork and a capability-oriented brand-board handoff communicate the intended Falling Studio narrative. Mobile and reduced-motion paths use lighter, designed alternatives.
- Scene 04 uses four optimized derivatives of real WestCose portfolio work, a typed asset manifest, semantic figures, and one scene-local ScrollTrigger that scrubs deterministic page, ink, annotation, and micro-motion states in both directions.
- Scene 04 keeps CSS sticky positioning as the sole pin owner. Mobile and reduced-motion modes collapse the long scene into four readable normal-flow spreads.
- The Scene 04 to Scene 05 boundary uses a matched page flip, a brief off-white visual breath, and a neutral pen proxy. It does not fabricate corporate project content.
- Scene 03 is capability-led Brand Development / Identity Systems content. It uses real approved portfolio material without false Greenfield attribution and does not expose development labels, dimensions, future paths, or `ASSET PLACEHOLDER` UI.
- Scene 06 keeps its destinations as server-rendered links and progressively mounts a demand-rendered React Three Fiber orbit only on capable fine-pointer desktops near the viewport. Touch, reduced-motion, forced-colors, and WebGL-failure paths use the static selector.
- Scene 06 owns its scroll-to-Scene 07 white handoff locally. The orbit slows as the handoff resolves, and CSS sticky positioning remains the sole pin owner.
- Scene 07 contains a server-validated React Hook Form and Zod project brief. The Node route applies a streaming body cap, honeypot, best-effort rate limit, escaped email templates, Resend batch delivery, and idempotent retry key.
- Live project-brief delivery requires `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, and `CONTACT_TO_EMAIL`; see `.env.example`.
- Patch Logo 02 is the served navigation mark. The supplied six-up `W.svg` source is preserved, while its isolated monogram geometry is served as a clean derivative.
- `Portfolio`, `scenes`, and the original `illustrations` files remain protected source assets except for the two source files explicitly moved into their canonical public locations for Phase 6. Web derivatives live under `public/experience` and `public/brand`.
- Genuine Greenfield case-study assets and final Scene 05 client-specific project content remain pending until approved source material is supplied; this does not block the capability-led Homepage Scene 03. Phase 13 routes, CMS, analytics, and the final Falling Studio render remain in their roadmap phases.
- Project documentation in `docs` is the implementation source of truth.
