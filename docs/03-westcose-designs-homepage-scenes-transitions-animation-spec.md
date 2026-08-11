# WestCose Designs — Homepage Cinematic Scene Specification

**Document Type:** Homepage Experience / Motion / Scene Implementation Spec  
**Project:** WestCose Designs Website Redesign  
**Primary Domain:** `westcosedesigns.com`  
**Status:** Locked Creative Direction — Detailed Implementation Specification  
**Related Docs:**  
- `01-westcose-designs-project-scope-company-breakdown.md`
- `02-westcose-designs-technical-architecture-app-stack-mcps-dependencies.md`

---

# 1. Purpose

This document defines the complete homepage cinematic experience for WestCose Designs.

The homepage is not intended to behave like a traditional stack of independent website sections. It should feel like a **continuous interactive film** composed of connected scenes.

Every major scene should:

- have one dominant visual idea,
- have one primary interaction model,
- communicate one clear message,
- transition into the next scene through an existing visual object or material,
- retain usable SEO-readable HTML underneath the visual experience,
- support reduced-motion and mobile alternatives,
- and avoid unnecessary simultaneous animation.

The core homepage principle is:

> **Exit Object → Transformation → Next Environment**

The homepage should rarely use a generic fade, hard cut, or ordinary section divider. The final experience should feel like the user is moving through one connected WestCose world.

---

# 2. Asset Folder Contracts

The project will use the following root-level content folders for homepage source assets:

```text
/portfolio
/scenes
/illustrations
```

These folders should be treated as approved project asset sources.

## 2.1 `/portfolio`

Purpose: contains the user's real WestCose design work used throughout the homepage and project storytelling.

Examples:

- logos
- brand boards
- stationery
- apparel graphics
- healthcare identity work
- Greenfield Union School District assets
- mascot artwork
- print collateral
- brand guidelines
- mockups
- project photography
- presentation visuals

Recommended organization:

```text
/portfolio
  /greenfield
  /healthcare
  /apparel
  /logos
  /illustration
  /brand-development
  /corporate
```

If the original folder remains flatter, the application should still create a clean internal asset manifest rather than relying on arbitrary filename discovery at runtime.

## 2.2 `/scenes`

Purpose: contains the visual reference images created during concept development for each homepage scene.

These references are **art-direction references**, not necessarily production-ready final assets.

Recommended naming:

```text
/scenes
  scene-00-loader.png
  scene-01-liquid-hero.png
  scene-015-illustration-rail.png
  scene-02-falling-studio.png
  scene-03-greenfield.png
  scene-04-sketchbook.png
  scene-05-corporate.png
  scene-06-orbit.png
```

Use these references to preserve:

- composition
- lighting
- tone
- spacing
- cinematic framing
- material direction
- scene personality

Do not reproduce text or details from references blindly if the final content changes.

## 2.3 `/illustrations`

Purpose: contains the **four final artwork pieces** used in Scene 1.5.

Required count for V1:

```text
4 illustrations
```

Recommended filenames:

```text
/illustrations
  illustration-01.*
  illustration-02.*
  illustration-03.*
  illustration-04.*
```

Preferred asset qualities:

- high resolution
- transparent background when useful
- consistent cropping strategy
- clean edges
- production-ready artwork
- no unnecessary baked-in backgrounds unless intentional

These four illustrations should be treated as an ordered sequence.

---

# 3. Homepage Scene Order

Locked scene architecture:

```text
Scene 00 — Logo Loader
        ↓
Scene 01 — Liquid Shader Hero
        ↓
Scene 01.5 — Horizontal Illustration Rail
        ↓
Scene 02 — Falling Studio
        ↓
Scene 03 — Brand Development / Identity Systems
        ↓
Scene 04 — Sketchbook / Illustration World
        ↓
Scene 05 — Corporate Identity Contrast
        ↓
Scene 06 — WestCose Ecosystem Orbit
        ↓
Scene 07 — Project Brief / Contact CTA
```

Scene 07 is functional rather than cinematic-heavy, but should still inherit the visual language.

---

# 4. Global Experience Rules

## 4.1 One Dominant Motion Idea Per Scene

Do not animate everything.

Each scene gets one dominant interaction:

| Scene | Primary Interaction |
|---|---|
| 00 | Logo reveal / loading mask |
| 01 | Reactive liquid shader |
| 01.5 | Vertical-scroll-driven horizontal illustration movement |
| 02 | Scroll-driven falling video |
| 03 | Identity system assembly |
| 04 | Sketchbook / page / hand-drawn behavior |
| 05 | Corporate alignment / system snap |
| 06 | Interactive orbit system |
| 07 | Project brief reveal |

Secondary micro-interactions should remain subordinate.

## 4.2 Scroll Should Feel Intentional

Avoid arbitrary parallax on every image.

Use scroll for:

- scene progression
- camera progression
- horizontal translation
- sequence timing
- controlled reveals
- object transitions
- visual transformation

Do not use scroll simply to make every object drift.

## 4.3 Scene Rhythm and Breathing Room

Every pinned cinematic scene must define four meaningful phases:

```text
ENTER   approximately 0–15%
BUILD   approximately 15–70%
HOLD    approximately 70–85%
EXIT    approximately 85–100%
```

The percentages are tuning guides, not fixed constants.

A HOLD is a readable composition interval, not a dead-scroll zone. While the composition holds, the scene should still communicate progress through controlled settling, line progression, subtle camera or depth movement, local progress fill, or exit preparation.

Recommended rhythm:

```text
intense transition
→ settle
→ hold a responsive composition
→ allow copy to be read
→ prepare the next transformation
```

Tune pinned distance visually. Do not keep the visitor pinned while hundreds of pixels of scroll produce no meaningful response.

---

# 5. Persistent Continuity Motifs

Three recurring elements should help connect scenes.

## 5.1 The WestCose W

The W is the primary brand anchor.

It appears as:

- loader logo
- transition mask
- subtle construction geometry
- eventual central object in Scene 06

The W should not be stamped everywhere. Its appearances should feel meaningful.

## 5.2 The WestCose Thread

A thin line derived from the W construction geometry should travel conceptually through the experience.

Material state by scene:

```text
Loader
→ vector construction stroke

Liquid
→ refracted light streak

Illustration Rail
→ motion underline / trail

Falling Studio
→ vertical guide / depth streak

Brand Development
→ identity construction line

Sketchbook
→ graphite pencil stroke

Corporate
→ grid / alignment line

Orbit
→ orbital path
```

This is a subtle continuity system. It should not feel like a literal decorative line pasted across every viewport.

## 5.3 The Designer Pen / Pencil

Use one recurring physical object sparingly.

Potential appearances:

- floating in Scene 02
- beside identity-system assets
- drawing into Scene 04
- rolling into Scene 05

The goal is continuity, not a recurring mascot gag.

---

# 6. Global Navigation Behavior

Navigation should persist across the experience but change material state.

Recommended structure:

```text
WestCose mark / studio label
Work
Services
Studio
Start a Project
Labs ↗
Shop ↗
```

### Scene 00
Hidden.

### Scene 01
Very subtle translucent / liquid-glass appearance.

### Scene 01.5
Minimal white / bone interface.

### Scene 02
HUD-like translucent state.

### Scene 03
Structured identity-system state.

### Scene 04
Optional subtle handwritten accent in labels while preserving readability.

### Scene 05
Dark text on light / white visual environment.

### Scene 06
Return to luminous glass / dark mode.

### Scene 07
Functional, calm, highly readable.

Do not rebuild navigation separately per scene. One shared nav should transition between scene themes.

---

# 7. Global Cursor Behavior

Desktop only. Do not replace native usability entirely.

Recommended contextual states:

| Scene | Cursor State |
|---|---|
| 01 | DISTORT |
| 01.5 | VIEW |
| 02 | LOOK |
| 03 | EXPLORE |
| 04 | FLIP |
| 05 | VIEW |
| 06 | ENTER |
| 07 | START |

Touch devices do not receive cursor-specific effects.

---

# 8. Scene 00 — Logo Loader

## Purpose

Create a branded loading experience while critical above-the-fold assets initialize.

The loader should make the wait feel intentional without becoming slow or theatrical for its own sake.

## Visual Direction

- near-black background
- WestCose W centered
- clean negative space
- subtle texture / shader noise
- tiny studio metadata
- minimal or no visible progress percentage

Optional copy:

```text
WESTCOSE DESIGN STUDIO
BAKERSFIELD, CALIFORNIA
```

Avoid jokey loader copy in V1 unless it feels natural after prototyping.

## Animation Sequence

1. Black screen.
2. Thin construction lines begin drawing the W.
3. Linework completes.
4. The W becomes slightly more solid.
5. Subtle shader / light begins appearing inside or behind the W.
6. Once critical Scene 01 assets are ready, the W becomes a mask.
7. Camera / mask pushes forward through the center of the mark.
8. W edges move beyond viewport.
9. The user is now inside Scene 01.

## Loader Technical Rule

Do not intentionally hold the loader longer than required.

A tiny minimum visible time may be used only to prevent a flash. Do not fake a long loading sequence.

## Critical Preload Targets

Before dismissing loader, prioritize:

- Scene 01 shader module
- main logo
- primary fonts
- Scene 01 copy styles
- first illustration from Scene 1.5 if lightweight

Scene 02 and later assets should continue lazy loading afterward.

---

# 9. Transition 00 → 01

## Bridge Object

The W.

## Transformation

```text
W construction logo
→ W mask
→ liquid refraction
→ full-screen shader
```

Rules:

- no generic fade to black
- no hard DOM section switch
- loader background should visually match hero background
- transition should feel continuous

---

# 10. Scene 01 — Liquid Shader Hero

## Purpose

Establish mood, identity, restraint, and technical confidence.

This scene should be the quietest cinematic scene.

## Visual Direction

- dark charcoal / near-black
- liquid / smoke / ink shader
- bone / off-white typography
- extremely restrained UI
- cinematic negative space
- subtle noise
- faint floating dust if performance allows

Avoid:

- rainbow gradients
- neon-tech clichés
- excessive bloom
- gaming visual language
- overly reflective chrome

## Working Hero Message

```text
WE DON'T MAKE LOGOS.

WE BUILD THINGS
PEOPLE REMEMBER.
```

Final copy can change later. The scene system should not depend on exact line length.

## Motion

### Shader
Continuous slow movement. Cursor proximity creates restrained distortion.

### Typography
Recommended:

- masked line reveal
- subtle vertical entrance
- blur-to-sharp
- staggered but not bouncy

### Nav
Fades in after the hero establishes itself.

### Scroll Prompt
Minimal animated scroll indicator.

## Scroll Behavior

Scene begins largely viewport-locked.

User scroll gradually increases:

- shader flow direction
- highlight velocity
- horizontal energy

This prepares Scene 1.5.

---

# 11. Transition 01 → 01.5

## Bridge Material

The liquid shader.

The liquid begins flowing horizontally from right to left.

Highlights stretch into motion trails.

The first illustration enters as if being pulled by the liquid current.

The background shader persists so this does not feel like a new section simply appearing.

---

# 12. Scene 01.5 — Horizontal Illustration Rail

## Asset Source

Use the four artworks located in:

```text
/illustrations
```

Expected:

```text
illustration-01
illustration-02
illustration-03
illustration-04
```

## Purpose

Immediately demonstrate WestCose's illustration and apparel personality before the user enters the broader portfolio world.

This is not a generic carousel. It is a cinematic scroll sequence.

## Core Interaction

The user scrolls vertically.

The artwork sequence moves horizontally:

```text
right → left
```

The vertical scroll distance maps to horizontal travel using pinned / scrubbed scroll behavior.

## Layout

Recommended:

- one illustration becomes dominant at a time
- next and previous pieces may remain partially visible at edges
- significant negative space around artwork
- minimal metadata
- full-screen or near-full-screen visual experience

Do not display four equally sized cards.

## Per-Illustration Behavior

### Entry
Artwork enters from right with slight depth / scale offset.

### Center State
When centered:

- motion slows
- artwork scales slightly
- background shader reacts
- small category label reveals
- optional subtle handwritten annotation

### Exit
Artwork continues left.

Scale decreases slightly.

A short motion blur / shader trail can increase during acceleration.

## Shader Response

The underlying shader should subtly react to each illustration.

Possible inputs:

- manually defined accent color
- center proximity
- scroll velocity
- scene-specific glow

Prefer manual metadata over expensive real-time image sampling:

```ts
{
  id: "illustration-01",
  accent: "#...",
  label: "Illustration"
}
```

## Micro-Interactions

Possible:

- subtle artwork tilt based on pointer
- glass metadata chip
- tiny animated counter
- hand-drawn underline
- edge glow
- slow breathing scale

Avoid stacking all effects at once.

---

# 13. Transition 01.5 → 02

## Bridge Object

Illustration #4.

## Locked Concept

The fourth illustration does **not** exit left like the others.

Instead:

1. Illustration #4 reaches center.
2. Movement slows.
3. Its plane tilts backward in 3D.
4. The horizontal gallery gains depth.
5. Surrounding artwork becomes distant.
6. Gravity appears to take over.
7. The artwork drops downward.
8. The camera follows.
9. Scene 02 begins.

This is the first major perception shift from 2D website space into cinematic spatial movement.

---

# 14. Scene 02 — Falling Studio

## Purpose

Show the breadth of WestCose work through a cinematic free-fall sequence.

This scene should feel like the user is falling through a vertical world of design work.

---

# 15. Scene 02 V1 Production Approach

The final direction will use a **pre-rendered video** for the scroll-driven falling animation.

The final video does not exist yet.

For V1 development:

> **Use a placeholder video.**

This allows the scroll interaction, section timing, accessibility, responsive behavior, and transition choreography to be built before the final cinematic asset is produced.

---

# 16. Placeholder Video Requirements

Recommended temporary file:

```text
/public/experience/falling-studio/falling-placeholder.mp4
```

Optional poster:

```text
/public/experience/falling-studio/falling-placeholder-poster.webp
```

Placeholder video should ideally:

- be 5–15 seconds
- contain visible motion
- have enough visual change to test scroll scrubbing
- be lightweight
- use H.264 MP4 for broad compatibility

The placeholder does not need to resemble the final art direction perfectly. Its job is to validate the scroll system.

---

# 17. Final Falling Video Requirements

The final production video should be created specifically for scroll scrubbing.

Recommended characteristics:

- no audio required
- no hard cuts
- continuous vertical camera motion
- objects distributed through depth
- enough frames for smooth seeking
- predictable beginning and end poses
- no baked-in UI
- safe framing for desktop crop
- alternate mobile crop if needed

Potential visual content:

- brand boards
- posters
- apparel
- logos
- stationery
- sketch sheets
- labels
- folders
- Greenfield artifacts
- healthcare identity materials
- designer pen
- WestCose design fragments

Objects should move at different visual depth speeds.

---

# 18. Scroll-Driven Video Behavior

Scene is pinned.

Vertical scroll controls video playback position.

Conceptually:

```text
scrollProgress 0.0 → video time 0%
scrollProgress 0.5 → video time 50%
scrollProgress 1.0 → video time 100%
```

The video should **not autoplay independently** on desktop during the core scroll interaction.

Scroll position is the timeline.

## Recommended Interaction

- pin scene
- map scroll progress to `video.currentTime`
- smooth small seek jumps if needed
- preload enough video data for responsive seeking
- show poster until video can seek
- preserve previous rendered frame during loading where possible

## Scroll Distance

Start with an approximate range such as:

```text
250vh–400vh
```

Then tune after the final video exists.

Do not lock scroll length permanently while using placeholder media.

---

# 19. Scene 02 Overlay UI

Keep overlays minimal.

Potential labels:

```text
IDENTITY
ILLUSTRATION
APPAREL
COLLATERAL
```

These can change based on progress.

Do not place large explanatory copy over the falling visual.

---

# 20. Scene 02 Fallbacks

## Mobile

Possible V1 approaches:

- same video with reduced scroll distance,
- separate mobile render,
- or limited scrub / inline video behavior.

Final behavior should be chosen after performance testing.

## Reduced Motion

Do not scrub the fall.

Use:

- poster image
- simple crossfades between selected stills
- normal content flow

---

# 21. Transition 02 → 03

## Bridge Object

A major brand board or identity-system artifact. Greenfield may supply this object when genuine approved Greenfield material is available, but the handoff must read as Brand Development without requiring the visitor to recognize a client.

## Transformation

Near the end of Falling Studio, expressive work gives way to increasingly system-oriented material:

- logos and lockups
- brand boards
- typography sheets
- color systems
- stationery
- guideline pages

A major brand board approaches the camera. At the handoff:

- the board dominates the composition,
- its orientation is close to the desired Scene 03 entry pose.

Then DOM / scene content takes over seamlessly.

Recommended handoff:

```text
final video frame
→ matched brand-board DOM asset
→ background continues moving briefly
→ board movement settles
→ grid lines appear
→ Scene 03 begins
```

The placeholder video remains an environmental layer rather than the complete scene. The foreground handoff must work even when the video cannot seek, and the final custom video should eventually be produced with this composition in mind.

---

# 22. Scene 03 — Brand Development / Identity Systems

## Purpose

Demonstrate WestCose's ability to turn a mark into a serious, structured, scalable identity system.

This is a capability-focused proof scene. A visitor should understand the service without knowing a particular client or project name.

Greenfield remains a flagship project, a valuable source of real identity-system proof when approved assets are available, and a future feature case study. It is no longer the required user-facing subject of Homepage Scene 03.

## Asset Source

Use real approved project assets from:

```text
/portfolio
```

Greenfield assets may be used from the following location when genuine approved files exist:

```text
/portfolio/greenfield
```

Do not relabel unrelated portfolio work as Greenfield. Do not expose development labels, dimensions, future paths, or `ASSET PLACEHOLDER` boxes in the production experience.

## Narrative Direction

Possible headline directions:

```text
FROM A MARK
TO A SYSTEM.

A LOGO
IS ONLY
THE START.

BUILT
BEYOND
THE MARK.
```

Choose one compositionally appropriate direction. Supporting copy should explain that WestCose identities extend through typography, color, applications, apparel, stationery, signage, digital, guidelines, and real production systems.

## Visual Direction

- dark or controlled neutral environment
- restrained project-derived color
- bone / white
- structured typography
- grid systems
- technical annotations
- construction geometry

This scene should feel precise after Scene 02's visual chaos.

---

# 23. Brand Development Scroll Choreography

Suggested sequence:

## Beat 1 — Mark
The incoming brand board settles. The primary mark arrives, and construction geometry or lockups establish the system.

Background depth movement continues briefly, then settles.

Possible label:

```text
MARK / IDENTITY / LOCKUPS
```

## Beat 2 — Typography
The mark shifts, a type specimen enters, and hierarchy, weights, and roles align.

## Beat 3 — Color
Color swatches build outward while controlled project color enters the accent or background system.

## Beat 4 — Architecture
Related marks, lockups, schools, departments, or other identity branches reveal how one system scales.

```text
ONE IDENTITY
MULTIPLE APPLICATIONS
```

## Beat 5 — Application
Approved stationery, apparel, guidelines, signage, folders, cards, or other real applications enter and align.

## Beat 6 — Complete System
All available proof resolves into one strong system composition.

```text
BUILT TO WORK EVERYWHERE.
```

## Motion Character

- precise
- controlled
- snap-to-grid
- measured
- confident

Do not use springy playful motion.

The entire pinned duration must contain meaningful visual progression. Any client-specific claims, counts, or outcomes require verified project evidence and enough context to be understood.

---

# 24. Transition 03 → 04

## Bridge Material

Identity-system construction line.

## Locked Concept

A precise vector construction line extends beyond the identity system.

The camera follows it.

Its behavior gradually changes:

```text
perfect vector
→ slight wobble
→ texture
→ graphite
→ pencil stroke
```

The line reveals that the user has entered a sketchbook.

A construction drawing from an approved identity-system asset may appear as a sketch on the first page.

Optional handwritten transition:

```text
KEEP GOING →
```

---

# 25. Scene 04 — Sketchbook / Illustration World

## Purpose

Show the raw, expressive, hand-built side of WestCose.

This scene should contrast strongly with the structured Brand Development system.

## Asset Source

Use selected artwork from:

```text
/portfolio
```

and optionally additional sketch assets prepared specifically for the scene.

## Visual Direction

- dark sketchbook
- bone paper
- graphite
- black ink
- tape
- registration marks
- handwritten notes
- subtle distressed surfaces
- authentic print / studio texture

Avoid fake vintage texture overload.

Texture should support the work, not bury it.

---

# 26. Scene 04 Motion

Potential sequence:

1. pencil line finishes drawing
2. page settles
3. artwork reveals through ink / graphite masks
4. annotations draw themselves
5. page turns or layers shift
6. selected illustrations subtly animate
7. final page prepares transition to Scene 05

## Subtle Illustration Animation

Allowed:

- eye blink
- smoke drift
- slight line shimmer
- tiny head movement
- ink crawl
- highlight flicker

Do not fully animate every illustration.

The art should remain the hero.

## Microcopy

Possible handwritten details:

```text
KEEP CREATING.
KEEP PUSHING.
```

or other final WestCose language chosen later.

Avoid filling every corner with jokes.

---

# 27. Transition 04 → 05

## Bridge Object

The sketchbook page and designer pen.

## Locked Concept

1. Final sketchbook page begins lifting.
2. Scroll controls page flip.
3. Backside becomes bright / blank.
4. Page fills viewport.
5. Brief white visual breath.
6. Pen rolls across the new white plane.
7. Grid / stationery begins appearing.
8. Scene 05 starts.

Concept:

```text
RAW IDEA
→ PAGE TURN
→ REFINED SYSTEM
```

---

# 28. Scene 05 — Corporate Identity Contrast

## Purpose

Demonstrate that WestCose can produce refined, trusted, professional corporate and healthcare-facing work.

This scene intentionally quiets the experience.

## Asset Source

Use corporate and healthcare identity assets from:

```text
/portfolio
```

Recommended internal organization:

```text
/portfolio/healthcare
/portfolio/corporate
```

## Visual Direction

- bright off-white / white
- restrained dark typography
- subtle brand accent color
- crisp photography
- stationery
- folders
- business cards
- corporate collateral
- clear alignment
- clean shadow behavior

This scene should feel almost Apple-like in restraint without becoming generic.

---

# 29. Scene 05 Motion

Use clean system behavior:

- items slide into alignment
- cards snap to grid
- folder closes / opens
- letterhead layers
- subtle perspective settle
- grid lines draw
- small labels type in
- shadows respond subtly to movement

Avoid:

- large spinning objects
- constant parallax
- loud shader effects

## Optional Glass Metadata

A small liquid-glass information panel can display:

- project category
- services
- year
- selected deliverables

Keep it small.

---

# 30. Transition 05 → 06

## Bridge Material

Corporate grid / layout guides.

## Locked Concept

The camera begins pulling away from the corporate composition.

The grid remains visible.

As distance increases:

- grid intersections glow,
- straight guides begin curving,
- layout lines transform into orbital paths,
- stationery lifts away from the plane,
- environment darkens,
- the central W emerges.

Concept:

```text
DESIGN GRID
→ SYSTEM MAP
→ ORBITAL SYSTEM
```

---

# 31. Scene 06 — WestCose Ecosystem Orbit

## Purpose

Introduce the broader WestCose ecosystem while keeping the three properties clearly differentiated.

Destinations:

```text
DESIGNS
LABS
SHOP
```

---

# 32. Scene 06 Core Visual

Central object:

```text
W
```

Three orbiting objects / worlds move around it.

The W should feel sculptural and iconic.

The orbit should feel calm and premium, not like a game UI.

---

# 33. Orbit Worlds

## Designs

Visual material:

- identity boards
- print
- illustration
- stationery fragments

Label:

```text
WESTCOSE DESIGNS
IDENTITY / ILLUSTRATION / APPAREL
```

## Labs

Visual material:

- UI windows
- software interfaces
- digital grid
- code-inspired geometry
- product screens

Label:

```text
WESTCOSE LABS
WEBSITES / SOFTWARE / EXPERIMENTS
```

## Shop

Visual material:

- shirt
- hat
- patch
- tag
- folded apparel
- packaging

Label:

```text
WESTCOSE SHOP
STREETWEAR / MERCH / OBJECTS
```

---

# 34. Orbit Motion

Idle:

- slow constant orbit
- subtle vertical float
- small orientation changes
- gentle light response

Pointer approach:

- orbit slows
- selected world gains emphasis
- other worlds recede slightly
- glass metadata appears
- cursor becomes `ENTER`

Pointer leave:

- world returns to orbit
- metadata fades
- orbit resumes

---

# 35. Orbit Interaction Rules

Do not:

- make the orbit too fast
- force users to chase moving targets
- require pixel-perfect hover
- rotate labels into unreadable positions

Interactive hit areas should be larger than the visible object.

---

# 36. Scene 06 Mobile

Preferred mobile direction:

- simplified orbit
- large central W
- three selectable destinations
- horizontal swipe or controlled orbit
- no hover dependency

Do not reproduce desktop mouse behavior on touch.

---

# 37. Scene 06 Reduced Motion

Use:

- static W
- three fixed destination nodes
- simple opacity / color emphasis
- no continuous orbit

---

# 38. Transition 06 → 07

The orbit system should slow.

The Design world or central W can shift upward.

A simple typographic statement appears.

The background becomes calmer.

Possible bridge:

```text
THE NEXT THING
DOESN'T EXIST YET.
```

Then:

```text
START A PROJECT
```

Exact copy will be finalized later.

---

# 39. Scene 07 — Project Brief CTA

## Purpose

Convert the visual experience into a qualified design inquiry.

This should not feel like a generic contact footer.

## Interaction Concept

Open a new creative brief.

Possible fields:

```text
Project Type
Name
Company
Email
Project Summary
Budget
Timeline
```

Project Type options:

```text
Brand Identity
Logo Design
Illustration
Apparel Design
Brand Development
Corporate Collateral
Ongoing Design Support
Not Sure Yet
```

## Visual Direction

- restrained
- calm
- strong typography
- subtle glass / form surface
- clear inputs
- excellent keyboard accessibility
- minimal motion

After the cinematic journey, usability takes priority.

---

# 40. Homepage Scroll Map

Initial conceptual scroll allocation:

```text
Scene 00 Loader
not scroll-driven

Scene 01 Liquid
~100–150vh

Scene 01.5 Illustration Rail
~300–450vh

Scene 02 Falling Studio
~250–400vh

Scene 03 Brand Development / Identity Systems
~400–600vh

Scene 04 Sketchbook
~300–500vh

Scene 05 Corporate
~250–400vh

Scene 06 Orbit
~150–250vh

Scene 07 Project Brief
normal document flow
```

Final values must be tuned after real assets and video exist.

Do not optimize for a specific total page height. Optimize for pacing.

---

# 41. Scene Component Structure

Recommended:

```text
components/home/
  HomeExperience.tsx
  HomeSceneController.tsx
  HomeSceneProgress.tsx

  Scene00Loader.tsx
  Scene01LiquidHero.tsx
  Scene015IllustrationRail.tsx
  Scene02FallingStudio.tsx
  Scene03Greenfield.tsx
  Scene04Sketchbook.tsx
  Scene05Corporate.tsx
  Scene06Orbit.tsx
  Scene07ProjectBrief.tsx
```

Legacy internal identifiers such as `Scene03Greenfield.tsx`, `fall-to-greenfield.ts`, or the `greenfield` scene ID may remain temporarily to avoid a rename-only refactor. They do not define the user-facing Scene 03 narrative, which must use Brand Development / Identity Systems language.

---

# 42. Scene Asset Manifests

Do not scatter raw file paths throughout animation code.

Create typed manifests.

Example:

```ts
export const illustrationScene = [
  {
    id: "illustration-01",
    src: "/illustrations/illustration-01.webp",
    label: "Illustration",
    accent: "#..."
  }
];
```

For portfolio-driven content, use a similar manifest or CMS mapping.

---

# 43. Scene State Model

Global scene state should expose only what shared UI needs.

Example:

```ts
type HomeSceneState = {
  sceneId: SceneId;
  progress: number;
  navTheme: "dark" | "light" | "glass";
  cursorMode: CursorMode;
};
```

Do not put every animated object into global React state.

GSAP / R3F should own frame-level animation state.

---

# 44. Transition Implementation Strategy

Transitions should not be built as independent generic overlay effects.

Each transition belongs to the scene pair.

Example modules:

```text
transitions/
  loader-to-liquid.ts
  liquid-to-illustrations.ts
  illustrations-to-fall.ts
  fall-to-greenfield.ts
  greenfield-to-sketchbook.ts
  sketchbook-to-corporate.ts
  corporate-to-orbit.ts
```

This allows each transition to understand both the outgoing and incoming scene.

---

# 45. ScrollTrigger Strategy

Use ScrollTrigger for major DOM-driven scene choreography.

Each scene should own:

- trigger
- pin behavior
- start
- end
- scrub
- timeline
- cleanup

Avoid one giant homepage GSAP timeline.

The global experience can coordinate scene boundaries, but each scene should remain independently debuggable.

---

# 46. Horizontal Scroll Strategy

Scene 1.5 should use pinned horizontal translation.

Preferred model:

```text
vertical scroll
→ normalized scene progress
→ horizontal track xPercent
```

Do not use native horizontal page scrolling.

The browser's document remains vertically scrollable.

---

# 47. Video Scroll Strategy

Scene 02 should use a dedicated scrub controller.

Responsibilities:

- load metadata
- calculate duration
- map scene progress to time
- debounce / interpolate seek updates if necessary
- handle stalled video
- handle mobile fallback
- expose poster fallback
- pause outside active scene

---

# 48. Visual Style Language

Across all scenes, WestCose should feel:

- cinematic
- graphic
- bold
- crafted
- modern
- tactile
- editorial
- slightly industrial
- independent
- design-led

Avoid visual language that feels:

- generic tech startup
- crypto
- cyberpunk
- template portfolio
- over-vintage
- overly glossy
- AI-generated collage
- corporate SaaS

---

# 49. Typography

Use typography as an active cinematic element.

## Display

Use one bold condensed display family in the Oswald direction across the homepage.

Preferred weights:

- Oswald Bold / 700 for major cinematic headlines
- Oswald SemiBold / Medium where a lighter display weight is needed

Purpose:

- scene headlines
- project names
- scene transitions
- major CTA labels
- contextual action labels such as `VIEW`, `LOOK`, `FLIP`, `ENTER`, and `START`

Use uppercase for major scene headlines, transitional statements, major CTAs, and contextual action labels. Do not create a separate display-font personality for every scene.

## Sans

Use a modern neutral sans such as Manrope where sustained readability matters.

Purpose:

- navigation
- body
- functional UI

## Mono / Technical

Reserve the mono or technical face for:

- scene numbers
- metadata
- tiny labels
- category data
- dimensions
- technical annotations

## Handwritten / Custom Marks

Use sparingly in Scene 04 and annotations only.

Do not use handwritten text as a body font.

---

# 50. Liquid Glass Usage

Liquid glass is an accent system.

Use for:

- nav
- metadata panels
- orbit labels
- project tooltip
- command palette
- small controls
- scene progress

Do not place every content block inside glass cards.

---

# 51. Micro-Animation System

Approved micro-animation categories:

## Magnetic Buttons
Use on primary CTAs.

## Text Reveals
- mask reveal
- line stagger
- blur-to-sharp
- subtle scramble where appropriate

## Hover Preview
Project links can reveal media previews.

## Spotlight
Use subtly in dark scenes.

## Cursor Labels
Contextual action feedback.

## Glass Panels
Short entrance / exit transitions.

## Scene Progress
Animated chapter indicator with a continuous fill tied to normalized local progress in the active pinned scene. Do not switch labels until the outgoing scene has completed its exit.

## Motion Trails
Only during high-energy transitions.

## Marquee
Use sparingly for ambient transition content, not as a default content layout.

---

# 52. 21st / Component Discovery Targets

When using 21st or similar component discovery tooling, search for behavior categories rather than trying to import complete page designs.

Useful searches:

```text
shader background
liquid shader
magnetic button
text reveal
horizontal scroll
image trail
custom cursor
spotlight hover
glass navigation
animated menu
scroll progress
hover image preview
3D card
orbit interaction
page transition
```

Any imported code should be converted into WestCose-owned components before production use.

---

# 53. Mobile Experience Rules

Mobile is not a miniature desktop.

For every scene define:

```text
desktop
tablet
mobile
reduced motion
fallback
```

Examples:

### Scene 1.5

Desktop:
full pinned horizontal sequence.

Mobile:
still horizontal-scroll-driven visually, but fewer perspective effects and shorter distance.

### Scene 02

Desktop:
scroll-scrubbed video.

Mobile:
simplified video behavior or alternate render.

### Scene 03

Desktop:
complex multi-stage identity assembly.

Mobile:
fewer simultaneous assets and shorter pinned timeline.

### Scene 04

Desktop:
page / sketchbook depth.

Mobile:
simplified page progression.

### Scene 06

Desktop:
3D orbit.

Mobile:
controlled orbit / swipe selector.

---

# 54. Reduced Motion Experience

Reduced-motion mode must preserve the narrative.

Recommended sequence:

```text
Loader
→ simple logo reveal

Hero
→ static shader / image

Illustrations
→ simple gallery

Falling Studio
→ selected stills

Brand Development
→ static staged system views

Sketchbook
→ static pages

Corporate
→ static editorial composition

Orbit
→ static three-destination selector

Project Brief
→ unchanged
```

No important information can exist only inside motion.

---

# 55. Accessibility

Required:

- semantic headings
- readable HTML copy outside canvases
- keyboard-accessible nav
- keyboard-accessible links
- visible focus
- meaningful alt text
- accessible form labels
- no hover-only critical information
- no forced motion
- no autoplay audio
- sufficient contrast
- reduced-motion support
- clear bypass to main content if loader is present

Canvas scenes should have textual alternatives.

---

# 56. Performance Budget Principles

The homepage is visually ambitious, so budget must be managed scene-by-scene.

Rules:

- do not render multiple active WebGL canvases simultaneously
- pause offscreen canvases
- lazy load scenes
- cap DPR
- optimize illustration dimensions
- compress poster images
- avoid huge transparent PNGs
- preload only Scene 01 critical assets
- defer Scene 02 video
- defer Scene 06 R3F until approaching viewport
- remove unused 21st dependencies
- profile ScrollTrigger
- avoid React state updates per animation frame
- test on real mobile hardware

---

# 57. Scene Loading Strategy

## Initial

Load:

- logo
- fonts
- Scene 01 shader
- hero copy
- nav

## After Hero Ready

Begin loading:

- illustration assets
- Scene 02 poster
- Scene 02 placeholder video metadata

## Before Scene 02

Ensure video is seek-ready.

## Later

Lazy load:

- brand-system detail images and approved identity proofs
- sketchbook assets
- corporate assets
- orbit WebGL bundle

---

# 58. Development Order

## Phase A — Structural Prototype

Build:

- scene wrappers
- approximate heights
- scene indicator
- theme changes
- no expensive visuals

Goal: validate pacing.

## Phase B — Scene 01

Build:

- loader
- shader hero
- loader-to-shader transition

Goal: validate first impression.

## Phase C — Scene 1.5

Build:

- illustration manifest
- horizontal scroll
- shader response
- final illustration tilt

Goal: validate horizontal-to-depth transition.

## Phase D — Scene 02

Build:

- placeholder video
- scroll scrub
- poster fallback
- final-frame handoff placeholder

Goal: validate video-based scroll system before final video production.

## Phase E — Scene 03

Build Brand Development / Identity Systems capability choreography using real approved project proof.

Goal: establish capability storytelling grammar without requiring recognition of a single client.

## Phase F — Scene 04 / 05

Build contrast pair:

```text
raw
→ refined
```

Goal: validate strongest tonal change.

## Phase G — Scene 06

Build orbit prototype.

Goal: validate interactive ecosystem navigation.

## Phase H — Scene 07

Build conversion flow.

## Phase I — Polish

Add:

- micro-interactions
- cursor states
- scene progress
- glass accents
- hover previews
- performance optimizations
- reduced motion
- mobile variants

---

# 59. Final Falling Video Production Checkpoint

Do **not** produce the final Scene 02 video before the placeholder interaction is tested.

First validate:

- desired scene duration
- scroll distance
- camera pace
- desktop framing
- mobile framing
- video seeking quality
- transition into the Scene 03 brand-system board

Then create the final video to match those requirements.

The final rendered video should intentionally end on a composition that can match the first Scene 03 brand-system DOM frame.

---

# 60. Locked Homepage Direction

The following decisions are locked for the working V1 direction:

- homepage is scene-based rather than section-based
- Scene 00 uses a WestCose logo loading animation
- Scene 01 uses an animated liquid shader
- Scene 1.5 uses four illustrations from `/illustrations`
- Scene 1.5 converts vertical scroll into right-to-left artwork movement
- Scene 1.5 transitions into Scene 02 by tipping the final illustration into depth
- Scene 02 is a scroll-driven falling sequence
- Scene 02 will ultimately use a custom video
- a placeholder video will be used during development
- Scene 03 focuses on Brand Development / Identity Systems; Greenfield may provide flagship proof but is not the required user-facing subject
- Scene 04 becomes a sketchbook / illustration world
- Scene 05 creates a bright corporate / healthcare identity contrast
- Scene 06 places the W in the center with Designs, Labs, and Shop orbiting around it
- orbit destinations are interactive
- scene transitions reuse objects already present in the outgoing scene
- generic fade transitions should be avoided where a physical transformation is possible
- `/portfolio` contains project assets
- `/scenes` contains approved scene references
- `/illustrations` contains the four Scene 1.5 artworks
- mobile and reduced-motion variants are mandatory
- motion must support storytelling rather than decorate every element

---

# 61. Core Motion Principle

The homepage should never feel like:

```text
section
fade
section
fade
section
fade
```

It should feel like:

```text
OBJECT
↓
TRANSFORMATION
↓
ENVIRONMENT
↓
OBJECT
↓
TRANSFORMATION
↓
ENVIRONMENT
```

The user's scroll is not merely moving the page.

It is advancing the film.
