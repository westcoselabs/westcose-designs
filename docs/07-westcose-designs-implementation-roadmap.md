# WestCose Designs — Implementation Roadmap

**Document Type:** Development Plan / Codex Execution Roadmap  
**Project:** WestCose Designs Website Redesign  
**Status:** Recommended Build Sequence  
**Related Docs:**  
- `01-westcose-designs-project-scope-company-breakdown.md`
- `02-westcose-designs-technical-architecture-app-stack-mcps-dependencies.md`
- `03-westcose-designs-homepage-scenes-transitions-animation-spec.md`
- `04-westcose-designs-seo-migration-url-strategy.md`
- `05-westcose-designs-ui-visual-design-system.md`
- `06-westcose-designs-content-portfolio-cms-framework.md`

---

# 1. Purpose

This roadmap defines how the WestCose Designs redesign should be implemented in phases.

The purpose is to prevent:

- building too much at once,
- premature animation complexity,
- dependency bloat,
- SEO migration mistakes,
- and large unreviewable agent-generated changes.

The preferred implementation model is:

> **Build → Review → Lock → Continue**

---

# 2. Global Engineering Rules

Before every phase:

1. read the relevant project docs
2. inspect the existing repo state
3. preserve approved architecture
4. avoid unrelated refactors
5. use the smallest dependency set possible
6. test before moving forward
7. update documentation if architecture materially changes

---

# 3. Agent / Codex Rules

Codex should not:

- redesign approved scenes without direction
- replace the chosen stack
- install overlapping animation libraries
- create a database in V1
- add auth
- add ecommerce
- move Labs into this repo
- hard-code every portfolio asset into scene components
- skip mobile / reduced-motion fallbacks
- change URLs without checking SEO migration requirements

---

# 4. Phase 0 — Repository Foundation

## Objective

Create the stable Next.js application foundation.

## Build

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- ESLint
- base folder structure
- environment variable template
- Git ignore rules
- root layout
- metadata defaults
- global CSS
- basic error / not-found pages

## Create

```text
/app
/components
/lib
/public
/docs
/seo
/portfolio
/scenes
/illustrations
```

## Acceptance Criteria

- app boots locally
- TypeScript passes
- lint passes
- no unnecessary dependencies
- folder structure matches architecture
- production build succeeds

## Do Not Build Yet

- homepage animations
- Sanity
- WebGL
- forms
- analytics
- final content

---

# 5. Phase 1 — Global Design Foundation

## Objective

Build the shared WestCose visual system before cinematic scenes.

## Build

- color tokens
- typography tokens
- spacing
- radii
- borders
- glass material
- container system
- editorial grid
- button primitives
- link treatments
- navigation shell
- footer shell
- focus styles

## Acceptance Criteria

- dark and light themes work
- typography scales responsively
- glass component maintains contrast
- buttons work with keyboard
- nav works desktop / mobile
- no generic starter styling remains

## Do Not Build Yet

- page-specific cinematic motion
- Brand Development / Identity Systems choreography
- orbit scene

---

# 6. Phase 2 — Homepage Structural Prototype

## Objective

Validate the complete homepage rhythm before adding expensive effects.

## Build

Static wrappers for:

```text
00 Loader
01 Liquid Hero
01.5 Illustration Rail
02 Falling Studio
03 Brand Development / Identity Systems
04 Sketchbook
05 Corporate
06 Orbit
07 Project Brief
```

Use placeholder colors / media.

Add:

- scene IDs
- approximate scroll heights
- scene progress state
- nav theme switching
- cursor state switching
- reduced-motion detection

## Acceptance Criteria

- user can scroll through entire homepage
- scene order is correct
- pinned sections do not overlap incorrectly
- nav updates by scene
- mobile structure remains usable
- no horizontal overflow
- scene state cleans up correctly

## Do Not Build Yet

- final shader
- final video
- detailed scene animations

---

# 7. Phase 3 — Loader + Scene 01

## Objective

Lock the first impression.

## Dependencies

Add if not already installed:

```text
gsap
@gsap/react
lenis
```

Add shader / WebGL dependencies only if required by the chosen Scene 01 implementation.

## Build

- logo construction animation
- asset readiness state
- W mask transition
- liquid shader hero
- hero text reveal
- nav entrance
- cursor distortion
- scroll indicator

## Acceptance Criteria

- loader does not fake unnecessary wait time
- hero content exists as accessible HTML
- shader performs smoothly
- reduced-motion path exists
- mobile fallback exists
- transition from loader to hero feels continuous

## Do Not Build Yet

- illustration rail
- falling scene

---

# 8. Phase 4 — Scene 1.5 Illustration Rail

## Objective

Build the right-to-left illustration showcase.

## Asset Source

```text
/illustrations
```

Required:

```text
4 final illustration assets
```

## Build

- typed illustration manifest
- pinned horizontal sequence
- centered active-art state
- artwork scale / focus
- shader response
- metadata labels
- final illustration transition setup

## Acceptance Criteria

- vertical scroll controls horizontal movement
- four illustrations appear in intended order
- one illustration dominates at a time
- no native horizontal page scrolling
- mobile behavior works
- reduced-motion gallery works

## Do Not Build Yet

- final falling video
- full Brand Development / Identity Systems sequence

---

# 9. Phase 5 — Scene 1.5 → Scene 02 Transition

## Objective

Validate the first major dimensional transition.

## Build

- illustration #4 center lock
- plane tilt
- perspective shift
- gallery depth
- downward movement
- handoff to falling placeholder

## Acceptance Criteria

- illustration transition feels physically connected
- no hard visual cut
- scroll direction remains intuitive
- fallback still works without 3D transform

---

# 10. Phase 6 — Scene 02 Placeholder Falling Video

## Objective

Build the scroll-video system before producing the final video.

## Temporary Asset

```text
/public/experience/falling-studio/falling-placeholder.mp4
```

## Build

- video scrub controller
- poster state
- metadata loading
- progress → currentTime mapping
- pinning
- stalled-video fallback
- mobile behavior
- reduced-motion stills
- end-frame handoff placeholder

## Acceptance Criteria

- seeking feels responsive
- rapid scroll does not break video
- backward scroll works
- poster displays before readiness
- scene does not autoplay independently
- mobile remains usable
- fallback path exists

## Do Not Build Yet

- final falling video

---

# 11. Phase 7 — Scene 03 Brand Development / Identity Systems

## Objective

Build the first major capability-storytelling scene and show how WestCose develops a mark into a scalable identity system.

## Asset Source

```text
/portfolio
```

Use genuine approved Greenfield assets from `/portfolio/greenfield` when they are supplied. Greenfield remains a flagship proof source and future feature case study, but it is not the required user-facing subject of Homepage Scene 03.

Do not attribute unrelated portfolio work to Greenfield. Do not expose development placeholders as production content.

## Build

- final-frame matching brand board
- controlled handoff and grid reveal
- mark / lockup construction
- typography assembly
- color system
- identity architecture
- approved applications and stationery
- complete system view
- typed capability-oriented asset manifest or mapping

## Acceptance Criteria

- motion feels precise
- Brand Development / Identity Systems is understandable without prior client knowledge
- real approved project work remains readable and truthfully attributed
- Greenfield may support the scene without becoming its required public subject
- scene does not become a collage
- content is backed by real project assets
- no user-facing `ASSET PLACEHOLDER`, development dimensions, or future paths remain
- motion progresses meaningfully throughout the pinned duration
- mobile sequence is simplified appropriately
- reduced-motion static composition exists

---

# 12. Phase 8 — Scene 03 → Scene 04 Transition

## Objective

Transform precision into raw creativity.

## Build

```text
vector construction line
→ imperfect line
→ graphite
→ sketchbook
```

## Acceptance Criteria

- transformation reads visually
- line remains performant
- final identity-system state resolves cleanly
- Sketchbook begins without generic fade

---

# 13. Phase 9 — Scene 04 Sketchbook

## Objective

Show WestCose's expressive illustration / apparel side.

## Build

- sketchbook environment
- page layers
- graphite / ink reveals
- annotations
- selected artwork
- minimal illustration micro-animation
- page-turn setup

## Acceptance Criteria

- artwork remains the focus
- texture does not overwhelm
- no fake-vintage overload
- animation remains subtle
- mobile page sequence works
- reduced-motion page layouts work

---

# 14. Phase 10 — Scene 05 Corporate

## Objective

Create a dramatic shift into professional corporate identity work.

## Build

- page flip from Scene 04
- white visual breath
- pen bridge object
- corporate stationery
- grid reveal
- snap-to-alignment animation
- subtle metadata

## Acceptance Criteria

- tonal contrast is strong
- visual treatment remains premium
- scene proves professional range
- motion is calmer than previous scenes
- copy remains readable

---

# 15. Phase 11 — Scene 06 Orbit

## Objective

Build the WestCose ecosystem destination scene.

## Dependencies

Add only if needed:

```text
three
@react-three/fiber
@react-three/drei
```

## Build

- central W
- Designs orbit node
- Labs orbit node
- Shop orbit node
- slow idle orbit
- hover focus
- larger invisible hit areas
- metadata panel
- click destinations
- mobile controlled selector
- reduced-motion static layout

## Acceptance Criteria

- targets are easy to interact with
- orbit does not move too fast
- UI labels remain readable
- WebGL pauses offscreen
- mobile does not depend on hover
- Labs / Shop links are clearly external where applicable

---

# 15.5. Phase 11.5 — Homepage Refinement, Motion Stabilization & Narrative Pass

## Objective

Refine the completed cinematic homepage so it reads as one continuous, stable experience rather than a collection of scene prototypes.

## Timing Note

This phase belongs logically between Phases 11 and 12. In repository history, Phase 12 had already been implemented before this refinement was authorized, so Phase 11.5 is a retroactive pass. Preserve the completed Scene 07 project brief and do not expand, remove, or rebuild its form behavior.

## Build

- apply the shared Oswald-direction uppercase display system through global tokens and components
- give every pinned scene explicit `ENTER`, `BUILD`, `HOLD`, and `EXIT` phases
- remove inert pinned-scroll zones while preserving readable composition holds
- strengthen Scene 01 and Scene 01.5 depth and their physical handoffs
- add deterministic foreground and midground artwork/category beats to Falling Studio while retaining the placeholder background video
- reposition Scene 03 as Brand Development / Identity Systems using truthful approved portfolio proof
- rebuild Scene 04 around one coherent sketchbook/page system
- continuously assemble Scene 05 and transform its grid into Scene 06 orbital geometry
- preserve the exact approved WestCose W silhouette and make Designs, Labs, and Shop read as three orbiting worlds
- connect the final editorial destination layout to the live orbit
- expose normalized local progress in the understated scene rail
- stabilize backward and rapid scrolling, lifecycle cleanup, asset failures, mobile, and reduced-motion paths
- optionally add development-only `?motionDebug=1` diagnostics without exposing them to normal visitors

## Acceptance Criteria

- no user-facing development placeholders, broken media states, blank canvases, or large dead-scroll zones remain
- every pinned scene visibly advances through `ENTER`, `BUILD`, `HOLD`, and `EXIT`
- Scene 03 communicates Brand Development / Identity Systems without requiring Greenfield recognition
- all displayed project work is real, approved, and truthfully attributed
- Scene 04 has one legible physical page model and deterministic forward/reverse page states
- the Corporate-to-Orbit handoff is continuous
- the central W preserves approved geometry with uniform scaling
- three distinct worlds visibly travel through front/back orbital depth and remain usable
- navigation remains one persistent component whose material state changes by scene
- the progress rail reflects actual normalized local progress
- mobile and reduced-motion presentations remain designed and complete
- backward and rapid scrolling do not leave stale transforms, doubled timelines, or orphaned ScrollTriggers
- offscreen video and WebGL work pauses where appropriate
- TypeScript, lint, production build, console, and overflow checks pass

## Out of Scope

- new Scene 07 form functionality
- standard site pages
- Sanity implementation
- SEO migration implementation
- final Falling Studio video production
- databases, authentication, Labs, Shop, or unrelated architecture refactors

---

# 16. Phase 12 — Scene 07 Project Brief

## Objective

Convert interest into inquiry.

## Dependencies

Add:

```text
react-hook-form
zod
@hookform/resolvers
resend
```

## Build

- project type
- name
- company
- email
- project summary
- budget
- timeline
- validation
- server submission
- internal email
- user confirmation
- success state
- spam protection

## Acceptance Criteria

- keyboard usable
- errors are clear
- server validation exists
- secrets stay server-side
- successful submission is confirmed
- spam protection does not create friction

---

# 17. Phase 13 — Standard Site Pages

## Objective

Build the complete non-homepage website.

## Routes

```text
/work
/work/[slug]

/services
/services/[service]

/studio
/process

/insights
/insights/[slug]

/contact
/start-a-project

/westcose-labs
/shop
```

## Acceptance Criteria

- standard pages are calmer than homepage
- design system remains consistent
- mobile navigation works
- internal linking works
- no cinematic requirement blocks content access

---

# 18. Phase 14 — Sanity CMS

## Objective

Move editable portfolio / marketing content into Sanity.

## Build

Schemas:

```text
Project
Service
Insight
Client
Category
Site Settings
Homepage
SEO
```

Add:

- GROQ queries
- typed query helpers
- draft preview
- image URLs
- content relationships

## Acceptance Criteria

- feature project can be authored
- visual project can be authored
- service page can be authored
- homepage can select featured work
- project relationships work
- draft preview works

---

# 19. Phase 15 — Portfolio Content Migration

## Objective

Populate real portfolio content.

## Process

For each project:

1. collect approved assets
2. determine project type
3. write summary
4. define services
5. define categories
6. choose hero
7. choose thumbnail
8. write alt text
9. create SEO metadata
10. publish / review

## Acceptance Criteria

- portfolio demonstrates range
- Greenfield is complete
- illustration / apparel are represented
- corporate / healthcare is represented
- no placeholder case study remains on production

---

# 20. Phase 16 — SEO Migration

## Objective

Protect existing organic search value.

## Build / Complete

- legacy URL inventory
- migration matrix
- redirects
- metadata
- canonicals
- sitemap
- robots
- structured data
- internal links

## Acceptance Criteria

- every valuable current URL has a decision
- redirect QA passes
- no chains
- no production `noindex`
- sitemap contains only canonical URLs
- homepage and case studies contain crawlable HTML

## Launch Blocker

Do not launch before the migration matrix is reviewed.

---

# 21. Phase 17 — Final Falling Video

## Objective

Replace placeholder with the custom final Scene 02 cinematic render.

## Production Requirements

Final video must match the tested interaction:

- validated duration
- validated scroll distance
- validated camera pace
- validated crop
- intentional final Scene 03 brand-system handoff frame

## Acceptance Criteria

- final video seeks smoothly
- visual starts at Scene 1.5 transition pose
- final frame matches Scene 03
- mobile asset strategy is confirmed
- file size is acceptable

---

# 22. Phase 18 — Motion Polish

## Objective

Add only approved micro-interactions after core experience is stable.

Potential:

- magnetic CTA
- hover previews
- cursor labels
- scene progress
- glass transitions
- image trail
- spotlight
- small text reveals

## Rule

No new effect is accepted solely because it looks cool.

It must improve:

- feedback
- hierarchy
- continuity
- or delight

---

# 23. Phase 19 — Performance Pass

## Objective

Profile the actual finished experience.

Check:

- JS bundle
- video size
- texture size
- canvas activity
- main-thread work
- LCP
- CLS
- INP
- scroll smoothness
- mobile GPU usage

Optimize:

- dynamic imports
- offscreen suspension
- DPR
- image sizes
- video preload strategy
- shader complexity
- GSAP timelines

---

# 24. Phase 20 — Accessibility Pass

## Objective

Validate that cinematic design remains usable.

Test:

- keyboard
- focus
- screen-reader structure
- reduced motion
- contrast
- forms
- menu
- external links
- canvas alternatives
- headings

---

# 25. Phase 21 — Browser / Device QA

Test:

```text
Chrome desktop
Safari desktop
Firefox
Edge
iPhone Safari
Android Chrome
```

Test both:

```text
normal motion
reduced motion
```

Use real phones for WebGL / video testing.

---

# 26. Phase 22 — Analytics & Monitoring

## Add

- Vercel Analytics
- Speed Insights
- Search Console

Optional later:

- GA4
- Plausible

## Acceptance Criteria

- production traffic records
- Core Web Vitals visible
- no double analytics events
- major CTAs can be measured if desired

---

# 27. Phase 23 — Launch Readiness

Required:

- production build passes
- lint passes
- E2E tests pass
- SEO migration checked
- content approved
- forms tested
- external links checked
- mobile checked
- reduced motion checked
- 404 checked
- analytics active
- backup / rollback path understood

---

# 28. Phase 24 — Launch

Deploy to:

```text
westcosedesigns.com
```

Do not change primary domain during the same launch unless separately approved.

After launch:

- verify redirects
- submit sitemap
- inspect Search Console
- monitor 404s
- monitor performance

---

# 29. Phase 25 — Post-Launch Improvements

Only after stabilization:

- refine motion timing
- add more case studies
- improve service copy
- publish insights
- evaluate search queries
- improve internal linking
- add optional components
- experiment with additional 21st-derived interactions

---

# 30. Suggested Milestone Groups

## Milestone A — Foundation

Phases:

```text
0–2
```

Result:

A stable, styled, scrollable skeleton.

## Milestone B — Cinematic Core

Phases:

```text
3–11.5
```

Result:

The complete cinematic homepage with truthful approved portfolio proof, no user-facing development placeholders, and placeholder background video only where explicitly allowed for Falling Studio.

## Milestone C — Business Site

Phases:

```text
12–15
```

Result:

Lead capture, site pages, CMS, portfolio content.

## Milestone D — Migration

Phases:

```text
16–17
```

Result:

SEO-ready migration and final falling scene.

## Milestone E — Production

Phases:

```text
18–24
```

Result:

Polished, accessible, performant production launch.

---

# 31. Pull Request / Change Size Guidance

Prefer small logical changes.

Good:

```text
Add scene registry
Build liquid shader hero
Implement illustration rail
Add scroll-video controller
Create project schema
```

Bad:

```text
Build entire homepage and CMS
```

Large agent-generated changes are harder to validate.

---

# 32. Definition of Done Per Phase

A phase is done when:

- functionality works
- mobile behavior exists
- reduced-motion behavior exists where applicable
- lint passes
- TypeScript passes
- no obvious console errors
- scope did not expand unexpectedly
- acceptance criteria are met

---

# 33. Prototype Policy

Experimental visual work should begin isolated.

Use:

```text
/components/experiments
```

Once approved:

- simplify
- move into production location
- remove abandoned prototypes
- remove unused packages

---

# 34. Dependency Gate

Before installing a new package:

- explain what it solves
- confirm current stack does not already solve it
- confirm React / Next compatibility
- confirm bundle impact is acceptable
- isolate it if scene-specific

No package should be added because a copied component happened to require it.

---

# 35. Documentation Gate

If implementation changes a locked architectural decision, update the relevant doc.

Examples:

- new CMS
- new routing strategy
- new scene order
- new WebGL architecture
- URL migration change
- major dependency

Do not let docs become historical fiction.

---

# 36. Launch Blockers

The following block production launch:

- broken project brief form
- missing redirects for valuable legacy URLs
- accidental `noindex`
- severe mobile performance issue
- missing reduced-motion path
- inaccessible nav
- critical WebGL scene preventing content access
- placeholder project content presented as final
- broken Labs / Shop routing
- production console failures

---

# 37. Things Explicitly Outside This Roadmap

Separate projects:

- WestCose Shop redesign
- Doopify commerce implementation
- full WestCose Labs redesign / build
- user accounts
- ecommerce
- Stripe
- application database
- authentication system

---

# 38. Recommended First Codex Instruction

At project start, the implementation agent should be told to:

```text
Read docs 01–07.
Implement only Phase 0 from the implementation roadmap.
Do not begin later phases.
Preserve the locked architecture.
At completion, report changed files, commands run, validation results, and any blockers.
```

This pattern should continue phase-by-phase.

---

# 39. Core Implementation Principle

> **Prove the system before polishing the spectacle.**

The correct sequence is:

```text
architecture
→ structure
→ interaction
→ real content
→ migration
→ polish
→ performance
→ launch
```

Not:

```text
effects
→ more effects
→ rewrite everything
```

---

# 40. Locked Roadmap Direction

- build in controlled phases
- review between phases
- use placeholder falling video before final production
- keep homepage scenes independently debuggable
- complete the business site before launch polish
- treat SEO migration as a launch requirement
- add micro-animation late
- profile finished effects rather than guessing
- preserve mobile, reduced-motion, and accessible alternatives throughout
