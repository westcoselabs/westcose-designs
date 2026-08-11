# WestCose Designs — Technical Architecture, App Stack, MCPs & Dependencies

**Document Type:** Technical Architecture / Engineering Foundation  
**Project:** WestCose Designs Website Redesign  
**Primary Domain:** `westcosedesigns.com`  
**Status:** Recommended Build Architecture — Working Foundation  
**Last Updated:** August 2026

---

# 1. Technical Goal

The WestCose Designs website should be built as a **high-performance, SEO-first Next.js application with a cinematic interaction layer**.

The architecture must support:

- advanced scroll choreography
- pinned / scrubbed animation sequences
- horizontal scroll scenes
- shader-based backgrounds
- WebGL / 3D scenes
- page transitions
- animated typography
- liquid-glass UI details
- responsive behavior
- reduced-motion alternatives
- editable portfolio and service content
- strong technical SEO
- fast static content delivery
- clean long-term maintainability

The site should **not** become a WebGL application that happens to contain text.

It should remain a content-driven website whose cinematic effects progressively enhance the experience.

---

# 2. Core Architecture Principle

> **Server-render the content. Client-render the experience.**

This is the central architectural rule.

## Server Responsibilities

Use React Server Components and Next.js server rendering for:

- page structure
- service copy
- case-study content
- navigation data
- metadata
- structured data
- portfolio queries
- SEO content
- sitemap generation
- redirects
- static image markup
- contact form server actions / route handlers

## Client Responsibilities

Use Client Components only for:

- GSAP timelines
- ScrollTrigger
- Lenis
- Motion interactions
- shader canvases
- React Three Fiber
- pointer effects
- page transitions
- custom cursor
- orbit systems
- interactive project objects
- animation state

This keeps JavaScript away from content that does not need it.

---

# 3. Primary Application Stack

## Framework

### Next.js 16

Use the **App Router**.

Reasons:

- React Server Components
- nested layouts
- modern metadata API
- native sitemap and robots support
- image optimization
- route handlers
- streaming
- strong Vercel integration
- Turbopack development workflow
- modern caching and rendering patterns
- built-in Next.js DevTools MCP support

### React 19

Use the React version supported by the chosen Next.js release.

As of this architecture document, React 19.x is the current React generation and React Three Fiber v9 is designed to pair with React 19.

### TypeScript

All application code should use TypeScript.

No core production component should be authored as untyped JavaScript unless a third-party integration requires it.

---

# 4. Styling System

## Tailwind CSS 4

Tailwind should handle:

- layout
- spacing
- responsive breakpoints
- typography utilities
- state variants
- container sizing
- grid / flex
- basic animation-independent styling

Tailwind should **not** become the only design system.

The site should also use CSS variables for global WestCose design tokens.

Example token categories:

```css
--wc-bg
--wc-fg
--wc-bone
--wc-charcoal
--wc-accent
--wc-blue
--wc-orange
--wc-grid
--wc-glass
--wc-border
--wc-radius-sm
--wc-radius-md
--wc-space
--wc-ease-cinematic
--wc-ease-snap
```

---

## CSS Modules / Scoped CSS

Use scoped CSS where Tailwind becomes awkward, especially for:

- shader canvas wrappers
- complex masks
- custom blending
- pseudo-elements
- typography treatments
- clip paths
- scene-specific effects
- noise layers
- complex responsive animation styling

Do not force complex cinematic styling into unreadable utility strings.

---

# 5. Animation Stack

The project should use multiple animation tools, but each tool needs a clearly defined job.

---

## 5.1 GSAP

### Packages

```bash
gsap
@gsap/react
```

### Primary Role

GSAP is the **cinematic timeline engine**.

Use GSAP for:

- complex scroll sequences
- scene choreography
- pinned sections
- scroll scrubbing
- multi-element timelines
- perspective transitions
- object sequencing
- timeline labels
- entrance / exit choreography
- scene-to-scene transformation

### ScrollTrigger

ScrollTrigger is the primary scroll animation controller.

Use it for:

- pinning
- scrubbing
- horizontal scene movement
- scroll-driven transformations
- scene progress
- trigger zones
- timeline synchronization

### Rule

If an interaction requires a timeline with multiple coordinated elements, use GSAP.

Do not rebuild complex timelines with dozens of independent React state updates.

---

# 6. Smooth Scroll

## Lenis

### Package

```bash
lenis
```

Lenis should provide the site's smooth-scroll behavior.

Use it for:

- cinematic scroll feel
- WebGL / DOM scroll synchronization
- smoother GSAP choreography
- horizontal scroll experiences
- scroll velocity values

Lenis preserves native scrolling behavior and is designed to integrate with GSAP and WebGL.

### Integration Rule

Use **one global Lenis instance**.

Do not instantiate Lenis inside individual sections.

The root smooth-scroll provider should synchronize with the site's global animation loop.

### Accessibility

Lenis must be disabled or adjusted when:

- reduced motion is enabled
- native behavior is more appropriate on certain touch devices
- testing reveals browser-specific issues

Smooth scroll is an enhancement, not a requirement.

---

# 7. Micro-Interaction Stack

## Motion for React

### Package

```bash
motion
```

Motion should handle smaller interface interactions where GSAP would be excessive.

Use Motion for:

- magnetic buttons
- menu hover behavior
- layout transitions
- glass panel reveals
- simple component entrance / exit
- hover scaling
- tab / chip transitions
- small spring interactions
- mobile UI transitions

### Rule

**GSAP = cinematic sequences.**  
**Motion = component-level interaction.**

Do not create duplicate implementations of the same animation in both libraries.

---

# 8. WebGL / 3D Stack

## Three.js

### Package

```bash
three
```

Three.js provides the underlying WebGL rendering layer.

Use it for:

- shaders
- 3D objects
- particle systems
- custom materials
- camera movement
- orbiting ecosystem scene
- falling design-object scene
- spatial depth effects

---

## React Three Fiber

### Package

```bash
@react-three/fiber
```

React Three Fiber is the React renderer for Three.js.

Use React Three Fiber instead of manually maintaining a parallel Three.js application.

---

## Drei

### Package

```bash
@react-three/drei
```

Use Drei selectively for proven helpers such as:

- environment
- loaders
- texture utilities
- Float
- Html overlays where appropriate
- shader / material helpers
- performance utilities

Do not import large helper systems simply because they exist.

---

## Optional Postprocessing

### Package

```bash
@react-three/postprocessing
```

Only add this when a scene specifically needs effects such as:

- depth of field
- bloom
- vignette
- noise
- chromatic aberration

Postprocessing must be evaluated against mobile GPU performance.

---

# 9. Shader Strategy

Shaders will be used as a visual layer, not as the site's basic rendering system.

Likely shader use cases:

### Scene 1

Liquid / smoke / ink shader background.

### Scene 1.5

Reactive shader responding to illustration color / position.

### Scene Transitions

Distortion, displacement, blur, and masking.

### Scene 6

Atmospheric orbit environment.

---

## Shader Rules

- Prefer simple fragment shaders over unnecessarily complex simulations.
- Avoid large framebuffer chains unless visually necessary.
- Cap pixel ratio on expensive canvases.
- Suspend rendering when canvas is offscreen.
- Reduce particle counts on mobile.
- Disable expensive effects under reduced-motion mode.
- Provide a static CSS / image fallback when WebGL is unavailable.

---

# 10. WebGL Canvas Architecture

Do **not** create one massive permanent WebGL canvas for the entire website unless later prototyping proves that is clearly superior.

Recommended architecture:

```text
DOM Website
│
├── Scene 01
│   └── Local Shader Canvas
│
├── Scene 01.5
│   └── Local Shader / Illustration Layer
│
├── Scene 02
│   └── R3F Canvas — Falling Studio
│
├── Scene 03
│   └── Mostly DOM / GSAP
│
├── Scene 04
│   └── DOM / texture effects
│
├── Scene 05
│   └── DOM / GSAP
│
└── Scene 06
    └── R3F Canvas — Orbit System
```

Benefits:

- lower GPU usage
- easier mobile fallbacks
- smaller scene boundaries
- easier debugging
- better progressive loading
- reduced risk of the whole site depending on WebGL

---

# 11. Dynamic Imports

Heavy cinematic components should be loaded dynamically.

Examples:

```text
FallingStudioCanvas
OrbitUniverse
LiquidShader
IllustrationShader
HeavyPostprocessing
```

Use client-only dynamic imports where server rendering is not possible.

The core page content should still render without waiting for these modules.

---

# 12. Homepage Scene Architecture

Recommended structure:

```text
app/
└── page.tsx
```

Server component renders the homepage shell and content.

Client scene controller coordinates motion.

Example component breakdown:

```text
components/
└── home/
    ├── HomeExperience.tsx
    ├── SceneLoader.tsx
    ├── SceneLiquidHero.tsx
    ├── SceneIllustrationRail.tsx
    ├── SceneFallingStudio.tsx
    ├── SceneGreenfield.tsx
    ├── SceneSketchbook.tsx
    ├── SceneCorporate.tsx
    ├── SceneOrbit.tsx
    ├── SceneProjectBrief.tsx
    └── HomeSceneProgress.tsx
```

---

# 13. Motion Architecture

Create a dedicated motion layer.

```text
lib/
└── motion/
    ├── gsap.ts
    ├── lenis.ts
    ├── easings.ts
    ├── reduced-motion.ts
    ├── scene-registry.ts
    ├── transitions.ts
    └── scroll-progress.ts
```

## Scene Registry

Each scene should have a predictable identifier.

Example:

```ts
type SceneId =
  | "loader"
  | "liquid"
  | "illustrations"
  | "falling-studio"
  | "greenfield"
  | "sketchbook"
  | "corporate"
  | "orbit"
  | "brief";
```

This can drive:

- scene indicator
- cursor state
- nav state
- theme state
- analytics events
- background treatment

---

# 14. Shared Animation Loop

The site should avoid multiple unrelated `requestAnimationFrame()` loops.

Whenever practical:

- Lenis
- GSAP
- WebGL updates
- cursor interpolation

should be coordinated.

This avoids wasteful concurrent loops and makes timing easier to reason about.

A specialized shared RAF utility can be introduced later if profiling shows value.

Do not add one preemptively without evidence.

---

# 15. Page Transition Architecture

Page transitions should use a dedicated transition layer.

Recommended approach:

```text
app/
└── template.tsx
```

or an equivalent client transition wrapper around route content.

Transitions should be restrained outside the homepage.

Examples:

- W mask
- ink displacement
- project image expansion
- scene curtain
- liquid distortion

Page transitions must never delay navigation excessively.

---

# 16. UI Component System

Base reusable UI should live separately from cinematic scenes.

```text
components/
├── ui/
├── motion/
├── layout/
├── navigation/
├── portfolio/
├── case-study/
├── forms/
└── home/
```

Example reusable components:

```text
MagneticButton
GlassPanel
SceneLabel
SceneProgress
ProjectPreview
ImageReveal
AnimatedHeadline
HoverPreviewLink
CursorLabel
OrbitLabel
CaseStudyStat
WorkGrid
ProjectMeta
WestCoseMark
```

---

# 17. 21st.dev Strategy

21st should be used as a **design and component acceleration tool**, not as the site's design system.

## 21st Uses

Search for reference implementations of:

- animated navigation
- magnetic buttons
- text effects
- galleries
- shader components
- cursor effects
- sticky sections
- glass panels
- hover previews
- menus
- animated grids
- scroll interactions

## Required Workflow

```text
Search
↓
Inspect source
↓
Install / copy
↓
Strip generic styling
↓
Rebuild with WestCose tokens
↓
Test accessibility
↓
Test performance
↓
Promote to approved internal component
```

No component should be considered production-ready simply because it was sourced from 21st.

---

# 18. shadcn/ui Strategy

Use shadcn selectively for **functional UI**, not the cinematic visual identity.

Good use cases:

- dialogs
- form primitives
- accessibility patterns
- command palette
- sheet / drawer
- popover
- tooltip
- select
- input
- textarea
- toast

Avoid using stock shadcn cards, buttons, and page layouts without significant WestCose restyling.

The visual site should not look like a shadcn starter.

---

# 19. Content Management System

## Sanity

Recommended CMS for:

- projects
- case studies
- services
- insights
- site settings
- project categories
- SEO metadata
- related projects
- image assets
- reusable project blocks

### Packages

```bash
next-sanity
@sanity/image-url
```

Sanity's official Next.js integration supports:

- App Router
- Server Components
- typed GROQ queries
- visual editing
- draft mode
- live content
- image CDN transformations

---

# 20. Sanity Architecture

Recommended model:

```text
Sanity Content Lake
│
├── Project
├── Service
├── Insight
├── Client / Organization
├── Project Category
├── Site Settings
├── SEO Defaults
└── Homepage Featured Work
```

---

## Project Document

Potential fields:

```text
title
slug
client
year
industry
services[]
summary
heroMedia
featured
projectType
caseStudyLevel
colorTheme
gallery[]
challenge
approach
identitySystem
applications
results
relatedProjects[]
seoTitle
seoDescription
ogImage
```

---

# 21. Sanity Studio

Recommended approach:

**Deploy Sanity Studio separately** rather than embedding it into the public production route.

Benefits:

- cleaner public app
- isolated editing surface
- simpler public bundle
- fewer accidental route conflicts

The website can still support Visual Editing / Presentation Tool previews.

---

# 22. Data Layer

No traditional application database is required for V1.

The site is primarily:

- portfolio content
- service content
- marketing pages
- contact inquiries

Use:

- Sanity for editable content
- Resend for email delivery

Do **not** add PostgreSQL, Prisma, Supabase, Firebase, or another database unless a later feature actually requires persistent application data.

---

# 23. Contact / Project Brief

## Form Stack

```bash
react-hook-form
zod
@hookform/resolvers
```

Use:

- React Hook Form for client UX
- Zod for shared validation
- server-side validation before sending

---

## Email

### Resend

```bash
resend
```

Optional:

```bash
@react-email/components
```

Use Resend for:

- project inquiry notification
- confirmation email
- internal lead delivery

Do not expose API keys client-side.

---

# 24. Spam Protection

Start simple.

Use:

- hidden honeypot
- server validation
- basic rate limiting if required

If spam becomes a real issue, add Cloudflare Turnstile.

Do not add a visually intrusive CAPTCHA by default.

---

# 25. Analytics

Recommended baseline:

```bash
@vercel/analytics
@vercel/speed-insights
```

Use Vercel Analytics for lightweight traffic measurement and Speed Insights for real-user Core Web Vitals monitoring.

Also connect:

- Google Search Console

Optional later:

- GA4
- Plausible

Avoid running multiple overlapping analytics platforms without a specific business need.

---

# 26. SEO Architecture

Use built-in Next.js metadata APIs.

Required:

```text
generateMetadata()
sitemap.ts
robots.ts
opengraph-image
twitter-image
canonical URLs
JSON-LD
redirects
```

Create structured data for:

- Organization
- ProfessionalService / LocalBusiness where appropriate
- WebSite
- BreadcrumbList
- CreativeWork / project pages
- Article / insight pages

---

# 27. Redirect Architecture

The WordPress-to-Next.js migration must preserve SEO equity.

Maintain a redirect map such as:

```text
seo/
├── legacy-urls.csv
├── redirects.ts
└── migration-audit.md
```

Use permanent redirects for URLs intentionally moved.

Do not redirect every removed page to the homepage.

Redirect each legacy URL to the most semantically equivalent new page.

---

# 28. Media Strategy

## Images

Primary:

- Sanity image CDN
- Next.js `<Image>`

Use `/public` for:

- logos
- tiny fixed icons
- reusable textures
- small immutable brand assets

---

## Large Visual Assets

Potential assets:

- high-resolution artwork
- 3D textures
- GLB models
- shader textures
- sequence images

Keep scene assets grouped by feature.

Example:

```text
public/
└── experience/
    ├── loader/
    ├── liquid/
    ├── illustrations/
    ├── falling-studio/
    ├── greenfield/
    ├── sketchbook/
    ├── corporate/
    └── orbit/
```

---

## Video

Do not add a video platform unless required.

For a small number of optimized background videos:

- Vercel Blob or a comparable object store can be considered.

For a future site with significant streaming video:

- Mux should be evaluated separately.

---

# 29. Hosting & Deployment

## Vercel

Recommended hosting platform.

Reasons:

- first-class Next.js support
- preview deployments
- CDN
- image optimization
- analytics
- Speed Insights
- environment variables
- rollbacks
- domain management

---

# 30. Environment Variables

Example:

```env
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
SANITY_API_READ_TOKEN=
SANITY_REVALIDATE_SECRET=
RESEND_API_KEY=
CONTACT_TO_EMAIL=
NEXT_PUBLIC_VERCEL_ENV=
```

Optional:

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

No secret should use the `NEXT_PUBLIC_` prefix.

---

# 31. Testing Stack

## End-to-End

### Playwright

```bash
@playwright/test
```

Required E2E scenarios:

- homepage loads
- navigation works
- scenes remain usable
- contact form works
- service routes work
- project routes work
- Labs and Shop links work
- reduced-motion mode works
- mobile navigation works
- no accidental horizontal overflow
- critical SEO tags render

---

## Unit / Component Testing

Recommended only where logic warrants it.

Potential packages:

```bash
vitest
@testing-library/react
@testing-library/jest-dom
```

Focus unit tests on:

- utilities
- validation
- content transforms
- scene state
- SEO helpers

Do not write low-value tests for static visual markup.

---

# 32. Browser Testing

Minimum browsers:

```text
Chrome
Safari
Firefox
Edge
Mobile Safari
Chrome Android
```

WebGL scenes must be tested on real mobile hardware.

---

# 33. Performance Strategy

The cinematic site needs an explicit performance architecture.

## Rules

- Server Components by default.
- Dynamically load WebGL.
- Lazy load scenes below the fold.
- Use one smooth-scroll instance.
- Pause WebGL rendering offscreen.
- Cap device pixel ratio.
- Compress textures.
- Prefer AVIF / WebP for imagery.
- Avoid enormous transparent PNGs.
- Use GLTF / GLB compression when applicable.
- Avoid unnecessary postprocessing.
- Avoid simultaneous high-cost canvases.
- Never animate expensive layout properties when transforms will work.
- Profile before adding optimization abstractions.

---

# 34. Reduced Motion

The full content experience must work under:

```css
@media (prefers-reduced-motion: reduce)
```

Reduced-motion behavior:

- disable Lenis smoothing
- remove camera fly-through
- replace scrubbed transformations with static states
- disable cursor distortion
- reduce shader movement
- disable spinning / orbit velocity
- remove page-transition delays
- preserve all copy
- preserve all CTAs
- preserve all project access

Reduced motion should be treated as an alternate presentation, not an error state.

---

# 35. Mobile Architecture

Mobile should not attempt to reproduce every desktop effect 1:1.

Each cinematic scene should define:

```text
Desktop behavior
Tablet behavior
Mobile behavior
Reduced-motion behavior
WebGL fallback
```

Examples:

### Falling Studio

Desktop:
3D falling objects.

Mobile:
Reduced object count, shallower depth, lower DPR.

Fallback:
Layered DOM parallax.

### Orbit

Desktop:
Interactive 3D orbit.

Mobile:
Simplified orbit / swipe selector.

Fallback:
Static three-destination selector.

---

# 36. Recommended Production Dependencies

## Core

```bash
next
react
react-dom
```

## Styling

```bash
tailwindcss
@tailwindcss/postcss
clsx
tailwind-merge
class-variance-authority
```

## Motion

```bash
gsap
@gsap/react
motion
lenis
```

## WebGL

```bash
three
@react-three/fiber
@react-three/drei
```

Optional:

```bash
@react-three/postprocessing
```

## CMS

```bash
next-sanity
@sanity/image-url
```

## Forms

```bash
react-hook-form
zod
@hookform/resolvers
```

## Email

```bash
resend
```

Optional:

```bash
@react-email/components
```

## Analytics

```bash
@vercel/analytics
@vercel/speed-insights
```

## UI Utilities

Likely:

```bash
lucide-react
```

Only install Radix packages indirectly required by selected shadcn components.

Do not install the entire Radix ecosystem blindly.

---

# 37. Recommended Dev Dependencies

```bash
typescript
eslint
eslint-config-next
prettier
@types/node
@types/react
@types/react-dom
@types/three
@playwright/test
```

Optional testing:

```bash
vitest
@testing-library/react
@testing-library/jest-dom
jsdom
```

---

# 38. Dependency Policy

This project is particularly vulnerable to dependency bloat because motion / creative development libraries overlap heavily.

Before adding a package, answer:

1. What specific problem does it solve?
2. Can an existing dependency already solve it?
3. Is it needed in production?
4. Is it maintained?
5. Does it support React 19 / current Next.js?
6. What does it add to the client bundle?
7. Does it require a separate animation loop?
8. Does it degrade safely?
9. Can the dependency be isolated to one scene?

If those questions do not have good answers, do not add it.

---

# 39. Libraries We Should Avoid Duplicating

Do not simultaneously introduce several libraries for the same responsibility.

Avoid combinations such as:

```text
GSAP + Anime.js + Velocity
Lenis + Locomotive Scroll
Motion + React Spring + Framer-era duplicate libraries
Three.js + Babylon.js
Sanity + Contentful
Zustand + Redux + Jotai
```

One primary tool per responsibility.

---

# 40. State Management

Do not install a global state library at project initialization.

Use:

- Server Component props
- React state
- context where necessary

If the cinematic homepage later develops significant cross-scene shared state, evaluate:

```bash
zustand
```

Only add it when state complexity justifies it.

---

# 41. MCP / Agent Tooling

MCP servers are **development tools**, not website runtime dependencies.

They should help Codex / VS Code inspect, prototype, test, and research the application.

---

# 42. Required MCP — 21st

## Purpose

Use 21st for:

- component discovery
- motion references
- visual exploration
- installing candidate UI components
- finding shader / effect references
- publishing successful internal WestCose components

### Tooling

21st provides a CLI / MCP-compatible agent workflow.

Recommended setup:

```bash
npm i -g @21st-dev/cli
21st login
npx @21st-dev/cli install-skill
```

Use 21st as a source of **editable code**, not an iframe or external runtime.

---

# 43. Required MCP / Tool — Playwright

## Purpose

Use Playwright for:

- browser automation
- responsive verification
- regression checks
- accessibility tree inspection
- route testing
- interaction testing
- animation state testing
- screenshots during development
- identifying overflow and layout bugs

### MCP

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

For coding-agent-heavy workflows, the Playwright CLI / skills workflow may be more token-efficient than MCP while MCP remains useful for persistent browser interaction.

---

# 44. Recommended MCP — Next.js DevTools

Next.js 16 introduced **Next.js DevTools MCP**.

Use it for framework-aware debugging and development assistance where supported by the coding environment.

This should be preferred over guessing about runtime Next.js behavior.

---

# 45. Recommended MCP — shadcn

Use the official shadcn MCP server for:

- locating accessible functional primitives
- command palette
- dialogs
- sheets
- popovers
- forms
- registry components

Do not use it as an automatic design generator for the entire site.

Example initialization depends on the agent client:

```bash
pnpm dlx shadcn@latest mcp init --client <client>
```

---

# 46. Recommended MCP — Context7

Context7 can provide current library documentation to coding agents.

Useful for:

- GSAP APIs
- Next.js changes
- React APIs
- Three.js / R3F
- Sanity
- Motion
- package migration questions

Use it to reduce outdated API assumptions.

This is particularly useful for a project using rapidly changing frontend libraries.

---

# 47. GitHub Integration

Use GitHub tooling after the repository is ready for remote collaboration.

Good uses:

- issue tracking
- pull requests
- code review
- CI inspection
- release history
- change tracking

The website should be developed locally first if desired; GitHub does not need to block initial setup.

---

# 48. MCP Governance

Do not give every MCP unrestricted authority.

Recommended policy:

### 21st
Allowed:
- search
- inspect
- install candidate components

Review required:
- production adoption

### Playwright
Allowed:
- browse
- inspect
- test
- screenshot

Avoid:
- arbitrary credential use

### shadcn
Allowed:
- browse registry
- install selected primitives

Avoid:
- bulk installing components

### Documentation MCPs
Read-only whenever possible.

---

# 49. Suggested Repository Structure

```text
westcose-designs/
│
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx
│   │   ├── work/
│   │   ├── services/
│   │   ├── studio/
│   │   ├── insights/
│   │   └── contact/
│   │
│   ├── api/
│   │   └── contact/
│   │
│   ├── layout.tsx
│   ├── template.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   └── globals.css
│
├── components/
│   ├── home/
│   ├── case-study/
│   ├── portfolio/
│   ├── navigation/
│   ├── motion/
│   ├── forms/
│   ├── layout/
│   └── ui/
│
├── lib/
│   ├── motion/
│   ├── seo/
│   ├── sanity/
│   ├── analytics/
│   ├── email/
│   ├── validation/
│   └── utils/
│
├── sanity/
│   ├── schemaTypes/
│   ├── queries/
│   └── structure/
│
├── public/
│   ├── brand/
│   ├── fonts/
│   ├── textures/
│   └── experience/
│
├── styles/
│
├── tests/
│   ├── e2e/
│   └── unit/
│
├── seo/
│   ├── legacy-urls.csv
│   └── redirects.ts
│
├── docs/
│
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── components.json
├── package.json
└── README.md
```

---

# 50. Route Strategy

Recommended application routes:

```text
/
 /work
 /work/[slug]

 /services
 /services/brand-identity
 /services/logo-design
 /services/illustration
 /services/apparel-design
 /services/brand-development
 /services/corporate-collateral

 /studio
 /process

 /insights
 /insights/[slug]

 /contact
 /start-a-project

 /westcose-labs
 /shop
```

The Labs and Shop pages on this domain should act as SEO-aware transition pages before sending visitors to their dedicated properties.

---

# 51. Rendering Strategy by Route Type

## Homepage

Hybrid:

- server-rendered content shell
- heavy client-side cinematic experience

## Service Pages

Mostly Server Components.

Use motion as enhancement.

## Work Index

Server-render projects.

Client-side filtering only where helpful.

## Case Studies

Mostly Server Components with isolated interactive storytelling modules.

## Insights

Server-rendered and highly SEO-oriented.

## Contact

Server-rendered shell with client-side form UX.

---

# 52. No Database / No Authentication in V1

The public website does not require:

- user accounts
- customer dashboard
- sessions
- database
- roles
- ecommerce
- Stripe

This keeps the architecture focused.

Sanity authentication is managed independently for content editors.

---

# 53. Build Tooling Philosophy

Codex and other agents should follow:

```text
Prototype
↓
Inspect
↓
Measure
↓
Simplify
↓
Productionize
```

Do not allow experimental shader or animation code to immediately become core architecture.

Experimental code should live in isolated prototypes until proven.

---

# 54. Prototype Folder

Consider:

```text
components/
└── experiments/
```

for:

- shader tests
- orbit experiments
- falling-object physics
- cursor effects
- transition tests

Once approved, move stable code into the actual scene / motion system.

This prevents the production component tree from turning into a graveyard of experiments.

---

# 55. Initial Install Strategy

Start lean.

## Phase 1

Install only:

```bash
next
react
react-dom
tailwindcss
@tailwindcss/postcss
typescript
eslint
eslint-config-next
```

## Phase 2 — Motion Prototype

Add:

```bash
gsap
@gsap/react
motion
lenis
```

## Phase 3 — WebGL Prototype

Add:

```bash
three
@react-three/fiber
@react-three/drei
```

## Phase 4 — CMS / Content

Add:

```bash
next-sanity
@sanity/image-url
```

## Phase 5 — Lead Capture

Add:

```bash
react-hook-form
zod
@hookform/resolvers
resend
```

## Phase 6 — Monitoring / Testing

Add:

```bash
@vercel/analytics
@vercel/speed-insights
@playwright/test
```

This staged installation makes regressions easier to trace.

---

# 56. Locked Technical Direction

The following should be treated as the working technical foundation:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Vercel
- Server Components by default
- client islands for animation
- GSAP + ScrollTrigger for cinematic timelines
- Lenis for smooth scroll
- Motion for micro-interactions
- Three.js + React Three Fiber for WebGL scenes
- local / isolated canvases rather than mandatory site-wide WebGL
- Sanity for portfolio and marketing content
- Resend for project inquiry email
- React Hook Form + Zod for form UX / validation
- Vercel Analytics + Speed Insights
- no application database in V1
- no authentication system in V1
- no ecommerce in this repository
- no Labs application in this repository
- 21st as component / motion discovery tooling
- Playwright as browser testing / agent tooling
- shadcn only for useful accessible functional primitives
- current library documentation should be checked before implementation
- every cinematic effect must have mobile, reduced-motion, and fallback behavior

---

# 57. Official Reference Notes

Architecture decisions were informed by current official documentation available in 2026:

- Next.js App Router / Next.js 16: https://nextjs.org/docs
- Next.js 16 release: https://nextjs.org/blog/next-16
- React versions: https://react.dev/versions
- Tailwind CSS: https://tailwindcss.com
- GSAP ScrollTrigger: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- Lenis: https://github.com/darkroomengineering/lenis
- React Three Fiber: https://r3f.docs.pmnd.rs
- Three.js: https://threejs.org/docs/
- Motion: https://motion.dev/docs
- Sanity + Next.js: https://www.sanity.io/docs/nextjs
- Resend + Next.js: https://resend.com/docs/send-with-nextjs
- Vercel Speed Insights: https://vercel.com/docs/speed-insights
- 21st agent tooling: https://docs.21st.dev/mcp
- Playwright MCP: https://github.com/microsoft/playwright-mcp
- shadcn MCP: https://ui.shadcn.com/docs/mcp
- Context7: https://context7.com/docs

---

# 58. Next Technical Documents

Recommended follow-up documents:

1. `03-homepage-scene-specification.md`
2. `04-transition-and-motion-system.md`
3. `05-ui-design-system.md`
4. `06-sanity-content-models.md`
5. `07-seo-migration-architecture.md`
6. `08-performance-and-accessibility-budget.md`
7. `09-development-phases-and-implementation-plan.md`

