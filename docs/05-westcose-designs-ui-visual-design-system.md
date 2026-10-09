# WestCose Designs — UI & Visual Design System

**Document Type:** Visual Language / UI System / Creative Guardrails  
**Project:** WestCose Designs Website Redesign  
**Status:** Working Visual System Specification  
**Related Docs:**  
- `01-westcose-designs-project-scope-company-breakdown.md`
- `03-westcose-designs-homepage-scenes-transitions-animation-spec.md`

---

# 1. Purpose

This document defines the visual and UI rules that keep the redesigned WestCose Designs website consistent across cinematic scenes, standard pages, portfolio content, forms, navigation, and future components.

The goal is not to create a rigid SaaS-style component library.

The goal is to create a **recognizable WestCose visual language** that can support both:

- highly cinematic homepage experiences,
- and calm, usable project / service pages.

---

# 2. Core Visual Position

WestCose Designs should feel:

- cinematic
- editorial
- graphic
- premium
- tactile
- modern
- independent
- slightly industrial
- illustration-led
- production-aware

It should not feel like:

- a generic Awwwards clone,
- a SaaS dashboard,
- a crypto site,
- a design-template marketplace,
- an overly distressed vintage brand,
- or a sterile corporate agency.

---

# 3. Primary Design Principle

> **The work is the loudest thing on the page.**

UI supports the artwork.

UI should not compete with:

- identity systems
- illustration
- apparel graphics
- stationery
- case-study visuals

---

# 4. Visual Rhythm

Use contrast between scenes and page sections.

Recommended rhythm:

```text
dark → expressive → spatial → structured → raw → bright → iconic
```

Do not maintain the same color, density, or animation intensity for the entire site.

Contrast is part of the brand experience.

---

# 5. Color System

Final exact production values should be tuned during design implementation.

Working token structure:

```css
--wc-black
--wc-charcoal
--wc-graphite
--wc-bone
--wc-offwhite
--wc-white
--wc-muted
--wc-border
--wc-glass
--wc-accent
--wc-blue
--wc-orange
--wc-green
```

## Core Neutrals

### Black
Primary cinematic background.

Use for:

- Scene 01
- Scene 02
- Scene 06
- fullscreen transitions

### Charcoal
Softer than pure black.

Use for:

- large dark panels
- secondary dark pages
- UI backgrounds

### Bone
Preferred light text / graphic neutral.

Use instead of pure white when a warmer print-like feeling is desired.

### Off-White
Primary light environment.

Use for:

- Scene 05
- editorial content
- case-study breathing space

---

# 6. Accent Color Rules

Accent color should usually come from **project content**, not a permanent rainbow UI system.

Examples:

- Brand Development scene → the active approved project's restrained accent; use Greenfield green only when genuine Greenfield proof is present
- healthcare scene → project blue
- illustration rail → artwork-specific accent
- orbit → controlled node-specific accents

WestCose global accents should remain restrained.

Do not create a full spectrum of neon UI accents.

---

# 7. Typography System

Typography should carry a large portion of the personality.

Use four functional layers.

## 7.1 Display

Purpose:

- cinematic headlines
- scene titles
- project names
- large transition phrases

Character:

- bold
- condensed or strong geometric structure
- confident
- highly legible at display sizes

Use one recognizable display family in the Oswald direction across the homepage:

- Bold / 700 for major cinematic headlines
- SemiBold / Medium where a lighter display weight is needed
- uppercase for major scene headlines, transitional statements, major CTA labels, and contextual action labels

Avoid overly futuristic novelty type.

Do not create a different display-font personality for each scene. Material, imagery, color, and motion may change while the WestCose typography system remains consistent.

---

## 7.2 Functional Sans

Purpose:

- navigation
- body copy
- forms
- service pages
- case-study content

Character:

- neutral
- modern
- highly readable
- capable of disappearing behind the work

Manrope-style clarity is appropriate where it supports the composition.

---

## 7.3 Mono / Technical

Purpose:

- scene numbers
- metadata
- tiny labels
- category data
- dimensions
- technical annotations

Keep this layer subordinate to the display and functional-sans layers.

---

## 7.4 Handwritten / Annotation

Purpose:

- Scene 04
- sketch notes
- arrows
- selective studio annotations

Rules:

- never body copy
- never primary navigation
- never essential instructions
- use sparingly

---

# 8. Typography Scale

Desktop should allow extreme scale contrast.

Example hierarchy:

```text
Display XL   10–18vw
Display L    6–10vw
H1           4–7rem
H2           2.5–4rem
H3           1.5–2rem
Body L       1.25–1.5rem
Body         1rem–1.125rem
Meta         .75–.875rem
Micro        .6875rem–.75rem
```

Use `clamp()` for responsive scaling.

Do not force these numbers literally where composition requires adjustment.

---

# 9. Editorial Composition

Avoid default centered-template composition.

Prefer:

- asymmetrical grids
- strong left alignment
- large negative space
- oversized crop
- deliberate text/image tension
- edge-aligned metadata
- occasional vertical labels

Centered composition is reserved for scenes where it has meaning, such as the Scene 06 W.

---

# 10. Spacing System

Spacing should feel generous.

Recommended principle:

```text
fewer elements
+ more space
+ larger scale
```

Avoid cramming portfolio content into dense card dashboards.

Case studies should breathe.

---

# 11. Grid System

Use a flexible 12-column editorial desktop grid.

Potential:

```text
Desktop: 12 columns
Tablet: 8 columns
Mobile: 4 columns
```

The homepage may intentionally break the grid.

Service and content pages should rely on it more consistently.

---

# 12. Shape Language

Use:

- sharp rectangles
- subtle radii
- editorial frames
- glass pills where functional
- circles when tied to orbit / system language

Avoid:

- giant soft rounded cards everywhere
- excessive pill containers
- bubbly SaaS UI

---

# 13. Radius System

Recommended:

```css
--wc-radius-xs
--wc-radius-sm
--wc-radius-md
--wc-radius-pill
```

Use larger radii primarily for:

- glass controls
- mobile sheets
- selected media frames

Do not default every component to `24px` rounded corners.

---

# 14. Border System

Borders should feel technical and understated.

Use:

- 1px low-opacity lines
- project-derived accent lines
- grid lines
- construction marks

Avoid thick decorative borders unless part of actual artwork.

---

# 15. Liquid Glass System

Liquid glass is a **supporting UI material**, not the website's entire visual identity.

Approved uses:

- persistent nav
- project metadata
- command palette
- scene progress
- orbit labels
- small action menus
- mobile nav
- contextual tooltips

Avoid:

- putting case-study content into glass cards
- glass behind every paragraph
- stacking glass-on-glass surfaces

---

# 16. Glass Material Recipe

Conceptually:

```text
translucent fill
+ controlled backdrop blur
+ subtle inner highlight
+ low-opacity border
+ soft shadow
```

Glass should remain readable over complex imagery.

Always provide a more opaque fallback where contrast fails.

---

# 17. Navigation

Navigation should be:

- minimal
- persistent
- scene-aware
- easy to understand
- visually secondary to the work

Desktop:

```text
WestCose
Work
Services
Studio
Start a Project
Labs ↗
Shop ↗
```

Mobile:

- compact top control
- fullscreen or sheet-style menu
- large easy tap targets

---

# 18. Buttons

Primary CTA behavior:

- magnetic pointer response on desktop
- subtle transform
- clear label
- strong focus state
- restrained visual style

Primary button should not look like a generic blue SaaS button.

Possible materials:

- bone on black
- black on bone
- subtle glass
- outlined editorial control

---

# 19. Magnetic Interaction Rules

Use magnetic behavior only on:

- primary CTA
- select nav actions
- orbit destinations

Do not magnetize every small link.

Movement should be subtle enough that the target remains easy to click.

---

# 20. Links

Text links should have a recognizable WestCose hover language.

Potential treatments:

- animated underline
- lateral arrow movement
- small image preview
- label shift
- mask reveal

Do not combine multiple hover treatments on one link.

---

# 21. Project Cards

Project cards should prioritize media.

Recommended:

```text
large image / motion
project name
category
year
```

Avoid:

- badge overload
- dense metadata
- boxed SaaS-card structure
- excessive descriptive copy on index cards

Details belong on the project page.

---

# 22. Project Hover Behavior

Desktop options:

- image scale
- slight directional movement
- title reveal
- alternate image
- cursor state `VIEW`
- floating media preview

Pick one strong behavior per grid style.

---

# 23. Image Treatment

Portfolio imagery should feel intentional.

Use:

- full bleed
- large-scale crop
- white-space editorial presentation
- carefully controlled shadows
- project-specific backgrounds

Avoid:

- random image aspect ratios with no system
- auto-generated masonry just because content differs
- repeated stock-device mockups
- overly dramatic fake shadows

---

# 24. Illustration Presentation

Illustration should often appear:

- large
- isolated
- with space
- on restrained backgrounds

Do not trap illustration inside small cards.

Transparent artwork may overlap the grid intentionally.

---

# 25. Case Study Modules

Reusable modules may include:

```text
CaseStudyHero
ProjectOverview
ProjectStat
IdentitySystem
LogoBreakdown
ColorSystem
TypographySystem
ApplicationGallery
EditorialImagePair
FullBleedMedia
ProcessStrip
RelatedWork
ProjectCTA
```

These should be layout tools, not rigid templates.

Major case studies should still feel individually art-directed.

---

# 26. Metadata

Use small restrained metadata.

Examples:

```text
CLIENT
YEAR
SERVICES
INDUSTRY
```

Style:

- uppercase or compact
- small size
- generous tracking
- high contrast
- often edge-aligned

---

# 27. Scene Labels

Homepage scene labels can use:

```text
SCENE 03
BRAND DEVELOPMENT
IDENTITY SYSTEMS
03 / 07
```

Keep them quiet.

They help orient the visitor but should never become the visual focus.

---

# 28. Scene Progress

Progress can be represented as:

- thin vertical rail
- chapter dots
- small numeric indicator
- line fill tied continuously to normalized local progress within the active pinned scene

Avoid a bulky progress widget.

Switch the scene label only after the outgoing scene completes its EXIT phase.

---

# 29. Custom Cursor

Desktop only.

Default cursor should remain understandable.

Context labels:

```text
VIEW
LOOK
EXPLORE
FLIP
ENTER
START
```

Do not hide the pointer completely on essential form controls.

---

# 30. Forms

Forms should feel like opening a design brief.

Use:

- large labels
- generous field spacing
- minimal chrome
- clear errors
- strong keyboard behavior

Avoid cramped stacked input boxes with generic borders.

---

# 31. Form Validation

Visual error state:

- concise text
- clear highlight
- no aggressive shake animation

Success state:

- calm confirmation
- next-step expectation

---

# 32. Motion Style

WestCose motion should feel:

- deliberate
- heavy enough to feel physical
- smooth
- cinematic
- controlled

Avoid:

- bouncy startup motion
- exaggerated spring physics
- random floating
- endless background movement
- every-element stagger

---

# 33. Easing Language

Maintain a small named set of easing behaviors.

Example:

```text
cinematic
snap
soft
linear-scroll
```

Do not use arbitrary easings in every component.

---

# 34. Micro-Animation Rules

Approved:

- magnetic CTA
- mask text reveal
- blur-to-sharp
- subtle hover scale
- line drawing
- spotlight
- glass reveal
- directional arrow movement
- cursor labels
- progress animation

Rule:

> **If the user notices the micro-animation before the content, reduce it.**

---

# 35. Texture Language

Texture sources may include:

- grain
- graphite
- paper
- ink
- subtle halftone
- print registration
- dust
- light scratches

Use only where the scene calls for tactile material.

Do not apply global distress to the entire website.

---

# 36. Shader Language

Shaders should feel:

- liquid
- ink-like
- smoky
- refractive
- atmospheric

Avoid:

- rainbow plasma
- noisy generative art that competes with text
- extreme displacement
- visual effects with no scene purpose

---

# 37. Icons

Use icons only when they improve comprehension.

Potential source:

```text
lucide-react
```

Rules:

- consistent stroke
- small
- functional
- avoid giant decorative iconography

Custom WestCose iconography should be used for branded moments.

---

# 38. 21st Component Adoption Rules

When importing inspiration or code:

1. identify useful behavior
2. inspect implementation
3. remove generic styling
4. replace all tokens
5. simplify dependencies
6. verify keyboard support
7. verify reduced motion
8. verify mobile
9. rename as a WestCose component
10. document its purpose

Never allow a component marketplace to dictate the visual language.

---

# 39. shadcn Usage Rules

Good uses:

- dialog
- sheet
- command palette
- form primitives
- popover
- tooltip
- accessible select

Bad use:

- stock cards
- stock landing-page sections
- default buttons
- default typography

Functional primitive first; WestCose styling second.

---

# 40. Responsive Design

Desktop can be cinematic.

Mobile must remain intentional.

Mobile priorities:

1. artwork
2. readability
3. touch interaction
4. performance
5. motion

Do not preserve desktop complexity at the expense of usability.

---

# 41. Reduced Motion Visual System

Reduced motion should still look designed.

Use:

- composition
- scale
- typography
- color
- static layered imagery

Do not simply turn off animation and leave awkward blank stages.

---

# 42. Accessibility Visual Rules

- visible focus
- sufficient contrast
- readable body text
- no essential low-opacity labels
- no information conveyed by color alone
- no hover-only navigation
- no tiny tap targets

Creative direction does not override usability.

---

# 43. Standard Page Style

Outside the cinematic homepage, standard pages should become calmer.

Recommended:

- editorial hero
- large heading
- restrained motion
- strong project media
- intentional grids
- spacious copy

The rest of the site should feel like the same brand without forcing every page into a cinematic scroll experience.

---

# 44. Work Index Style

Preferred:

- large project media
- category filtering if useful
- strong typography
- minimal chrome

Avoid a dense marketplace layout.

---

# 45. Service Page Style

Use:

- strong H1
- concise intro
- selected work
- editorial service details
- process
- related services
- CTA

Motion should enhance entrances and hover states only.

---

# 46. Insights Style

Insights should prioritize reading.

Use:

- strong editorial typography
- simple layout
- wide media breaks
- minimal motion
- useful related links

Do not apply homepage-level effects to article reading.

---

# 47. Visual Anti-Patterns

Do not use:

- generic three-card feature rows
- excessive centered copy
- purple/blue tech gradients
- large emoji icon blocks
- fake testimonials without strong context
- stock glass cards everywhere
- random blobs
- generic AI abstract imagery
- overly rounded UI
- unnecessary dashboard patterns
- ten different animation styles

---

# 48. Design Review Checklist

Before approving a component ask:

- Does the work remain the focal point?
- Does this feel like WestCose?
- Is the spacing strong?
- Is the typography deliberate?
- Is the motion helping?
- Is the UI simpler than it could be?
- Does it work without hover?
- Does it work on mobile?
- Does it work with reduced motion?
- Does it introduce a new visual pattern unnecessarily?

---

# 49. Locked Visual Direction

- dark cinematic scenes are balanced by bright editorial scenes
- bone / black / off-white form the primary neutral system
- project colors can become scene accents
- liquid glass is used selectively
- typography is large and editorial
- artwork remains visually dominant
- motion is controlled rather than constant
- textures are scene-specific
- components should not resemble stock SaaS UI
- standard pages are calmer than the homepage
- illustration, print, and production culture remain visible in the visual language

## Studio and destination components (October 2026)

The approved Built Here and Explore WestCose scenes extend the existing system:

- `styles/tokens.css` defines tan/brown primitives, semantic `--wc-warm-*` roles, and `--wc-destination-*` component tokens. Canvas lighting uses the matching named roles in `lib/home/orbit-palette.ts`.
- `GlassCard` supports `tone="warm"`. Its reusable surface treatment lives in `styles/destination-card.css`, not in homepage layout rules.
- `DestinationCard` composes `GlassCard` and `ButtonLink`: one compact row with title and description on the left and a pill CTA vertically centred on the right, plus an optional preview action. An optional `accent` tints the title and lights the CTA as coloured glass (Labs blue, Shop orange; Designs keeps the warm default). Hover, focus and orbit selection drive one registered `--wc-card-lit` property so the glass brightens smoothly. Every destination card carries a soft glowing edge in its own accent (tan, Labs blue, Shop orange) that `--wc-card-lit` intensifies; the hero service cards carry the same treatment in their coastal teal or signal orange tone. Render it within a list. `previewAction` opens detail; `href` navigates. Hover and keyboard focus brighten the edge and lift the card 3px. Coarse-pointer controls retain 44px targets; reduced motion removes the lift.
- `Eyebrow`, `DisplayHeading`, `Lede`, and `MetaLabel` provide the shared typography. Scene files only arrange these elements.
- `styles/studio-worlds.css` owns scene composition and responsive layouts. Below 64rem the orbit pins in a stacked layout: planets framed above the card block. On phones Built Here puts the art up top and the copy at the bottom so its last frame matches that layout. Reduced-motion and stacked WebGL fallbacks use normal flow with the approved artwork stills.
- Phones with motion allowed get the pinned, scroll-driven scenes too (`styles/mobile-scenes.css`, `MOBILE_MOTION_QUERY`): the shader at half resolution, the hero with its copy first, the cut-out portrait beneath it and an app-style service dock at the foot, the sideways illustration rail, the rail-to-studio paper peel and the studio-to-logo paper landing (the logo beats stay a stacked story on phones). Reduced motion, forced colours and no-script keep normal flow. The apparel picker on phones puts the Front/Back switch above a frameless full-width shirt, opens on the back, shows one cycler for the side in view, and turns the full kit into a swipeable strip. Pinned orbit cards on phones are compact title-and-button rows so the planets can read large; descriptions remain for screen readers and in each planet's detail panel.
- The worlds manifest owns destination copy and URLs. Designs retains `/work` (the portfolio route is not implemented yet); Labs opens `https://westcoselabs.com`; Shop opens `https://shop.westcose.com`. No external-site badges are shown.
- Built Here hands over to Explore WestCose without a seam: on desktop motion the orbit section overlaps the studio's last screen and stays hidden until it pins on an identical frame. The Designs still then recedes onto the live Designs planet and dissolves into it while Labs and Shop arrive from depth, the orbit paths draw on and the emblem turns to face the camera. The canvas is full-bleed with its lens centred right of the copy, so no planet is clipped at a column edge.
- Planets enlarge to 1.08 on hover while the orbit continues. Cards highlight their corresponding planet. Planet/title activation opens the existing rotatable, zoomable inspector; a card CTA navigates directly. Closing returns keyboard focus and resumes the orbit phase.
