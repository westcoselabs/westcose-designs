# WestCose Designs — Content, Portfolio & CMS Framework

**Document Type:** Content Architecture / Portfolio Taxonomy / Sanity CMS Model  
**Project:** WestCose Designs Website Redesign  
**Status:** Working Content System Specification  
**Related Docs:**  
- `01-westcose-designs-project-scope-company-breakdown.md`
- `02-westcose-designs-technical-architecture-app-stack-mcps-dependencies.md`
- `03-westcose-designs-homepage-scenes-transitions-animation-spec.md`
- `04-westcose-designs-seo-migration-url-strategy.md`

---

# 1. Purpose

This document defines how WestCose Designs content should be organized, modeled, authored, and connected across the new website.

The content system must support:

- feature case studies,
- smaller visual projects,
- service pages,
- homepage featured work,
- institutional and corporate projects,
- apparel and illustration work,
- SEO landing pages,
- insights,
- related-work relationships,
- Labs / Shop transition content,
- and future expansion without requiring a CMS redesign.

---

# 2. Core Content Principle

> **WestCose should organize work by capability and story, not by file dump.**

The portfolio should communicate:

- what was designed,
- why it mattered,
- what system was created,
- and how the work was applied.

Not every project needs a long case study.

The system should support both depth and speed.

---

# 3. Primary Content Types

The recommended V1 CMS contains:

```text
Project
Service
Insight
Client / Organization
Project Category
Site Settings
Homepage Configuration
SEO Defaults
```

Optional future types:

```text
Testimonial
Team Member
Award
Press Mention
Reusable CTA
```

Do not add optional types until actual content requires them.

---

# 4. Portfolio Project Types

There are two primary project formats.

## 4.1 Feature Case Study

Use when a project demonstrates:

- strategy
- identity systems
- multiple applications
- process
- scale
- outcomes
- or a significant body of work

Examples may include:

- Greenfield Union School District
- major healthcare identity work
- complete brand-development engagements
- large apparel systems

## 4.2 Visual Project

Use when the work is valuable and visually strong but does not require a long narrative.

Examples:

- logo design
- apparel graphic
- mascot
- patch
- illustration
- small identity project
- focused collateral package

---

# 5. Project Taxonomy

Projects should support multiple service / category relationships.

Recommended primary categories:

```text
Brand Identity
Logo Design
Illustration
Apparel Design
Brand Development
Corporate Collateral
Institutional Identity
Healthcare
Mascots
Merchandise
Print
```

Avoid creating dozens of overlapping tags.

Use categories that improve:

- browsing
- internal linking
- SEO
- related work

---

# 6. Project Document Model

Recommended Sanity `project` fields:

```text
title
slug
client
year
industry
location
projectType
summary
services[]
categories[]
featured
homepageFeatured
heroMedia
thumbnailMedia
accentColor
theme
credits
body
gallery
results
relatedProjects[]
seo
```

---

# 7. Core Project Fields

## `title`

Required.

Public project title.

## `slug`

Required.

Stable canonical project URL.

## `client`

Reference to Client / Organization where useful.

## `year`

Project year or range.

## `industry`

Examples:

```text
Education
Healthcare
Apparel
Professional Services
Industrial
Community
Retail
```

## `projectType`

Enum:

```text
feature-case-study
visual-project
```

## `summary`

Short editorial description.

Recommended length:

```text
1–3 short paragraphs
```

Used on:

- project intro
- previews
- metadata
- SEO support

---

# 8. Service Relationships

`services[]` should reference Service documents rather than storing arbitrary strings.

Examples:

```text
Brand Identity
Logo Design
Illustration
Apparel Design
Brand Development
Corporate Collateral
```

This enables automatic:

- related projects on service pages
- service links on projects
- internal linking
- portfolio filtering

---

# 9. Media Model

Project media should support:

```text
image
video
gallery
before / after
full bleed
pair
grid
transparent artwork
mockup
```

Each media item should include where applicable:

```text
asset
alt
caption
credit
layout
aspectRatio
background
priority
```

Do not store visual layout meaning only in filenames.

---

# 10. Hero Media

A project may use:

- image
- video
- layered composition
- animated media module

CMS should store the content.

The frontend should control the presentation.

Do not store arbitrary JSX-like layout decisions in Sanity.

---

# 11. Feature Case Study Structure

Recommended content order:

```text
1. Hero
2. Overview
3. Challenge
4. Creative Direction
5. Identity / Core System
6. Typography
7. Color
8. Applications
9. Process
10. Scale / Rollout
11. Results / Outcome
12. Gallery
13. Related Work
14. CTA
```

Not every feature case study must contain every block.

The model should be modular.

---

# 12. Feature Case Study Modules

Recommended portable content modules:

```text
projectIntro
textBlock
quote
projectStats
fullBleedMedia
imagePair
mediaGrid
logoSystem
colorPalette
typeSystem
identityBreakdown
applicationGallery
processSteps
beforeAfter
videoBlock
resultBlock
relatedWork
```

The goal is enough flexibility to art-direct a case study without turning the CMS into a page builder.

---

# 13. Visual Project Structure

Recommended:

```text
Title
Client
Year
Categories
Summary
Services
Gallery
Related Work
CTA
```

These pages should remain quick to author.

---

# 14. Homepage Featured Work

Homepage cinematic content should not depend on manually hard-coded project names everywhere.

Create a homepage configuration document.

Potential fields:

```text
featuredProjects[]
brandDevelopmentProjectRefs[]
corporateFeaturedProjects[]
illustrationRailMetadata[]
orbitLinks
heroCopy
finalCTA
```

However, the four Scene 1.5 artwork files remain sourced from:

```text
/illustrations
```

The CMS may provide:

- title
- category
- accent color
- alt text

without needing to own the actual source file during early development.

---

# 15. `/portfolio` Asset Relationship

The `/portfolio` project folder is the working source library for approved project assets.

During development:

- use these assets to prototype scenes and project pages,
- normalize naming,
- identify which assets should move into Sanity,
- avoid random runtime directory scanning.

Long-term:

- editorial project images should generally live in Sanity,
- fixed cinematic scene assets may remain in the application repository,
- extremely specialized video / 3D assets may remain in object storage or `/public`.

---

# 16. `/scenes` Relationship

`/scenes` contains art-direction references.

These should not be entered into the CMS as normal project content.

They exist to guide implementation.

---

# 17. `/illustrations` Relationship

Scene 1.5 uses four ordered artworks from:

```text
/illustrations
```

Maintain a typed manifest.

Example:

```ts
type IllustrationRailItem = {
  id: string;
  src: string;
  alt: string;
  label: string;
  accent: string;
};
```

---

# 18. Service Document Model

Recommended `service` fields:

```text
title
slug
shortTitle
summary
intro
deliverables[]
idealFor[]
process[]
featuredProjects[]
relatedServices[]
faq[]
seo
```

---

# 19. Core Service Documents

Create:

```text
Brand Identity
Logo Design
Illustration
Apparel Design
Brand Development
Corporate Collateral
```

Optional future:

```text
Ongoing Design Support
```

Do not create a service page until there is enough unique value and content.

---

# 20. Service Page Structure

Recommended:

```text
Hero
Introduction
What We Do
Deliverables
Selected Work
Process
Who This Is For
Related Capabilities
FAQ
Start a Project
```

Service pages should remain editorial rather than card-heavy.

---

# 21. Client / Organization Model

Recommended fields:

```text
name
slug
industry
location
website
logo
summary
```

A public client archive is not required.

The type exists primarily to normalize project data.

---

# 22. Insight Model

Recommended fields:

```text
title
slug
excerpt
publishedAt
updatedAt
author
heroImage
categories[]
body
relatedServices[]
relatedProjects[]
seo
```

Insights should be used for useful design content, not content-volume SEO spam.

---

# 23. Potential Insight Topics

Examples:

- brand identity process
- logo redesign considerations
- school / district identity systems
- preparing logos for apparel
- vector cleanup
- brand consistency
- logo lockups
- illustration in brand systems
- print vs digital logo requirements

Only publish when the studio has useful experience to contribute.

---

# 24. Site Settings Model

Potential fields:

```text
studioName
primaryEmail
phone
location
socialLinks
labsUrl
shopUrl
defaultCTA
footerCopy
navigation
```

Avoid hard-coding frequently changed business information in multiple components.

---

# 25. SEO Object

Reusable SEO field group:

```text
seoTitle
seoDescription
canonicalOverride
ogImage
noIndex
```

`noIndex` should default to false for public content.

---

# 26. Homepage Configuration

Recommended singleton.

Fields may include:

```text
heroEyebrow
heroHeadline
heroSubcopy
featuredProjectRefs
brandDevelopmentProjectRefs
corporateProjectRefs
finalCTATitle
finalCTABody
labsUrl
shopUrl
```

Do not put animation timing in the CMS.

Animation belongs in code.

---

# 27. Content vs Presentation Boundary

CMS owns:

- words
- media
- relationships
- project data
- SEO content

Application owns:

- animation
- layout system
- shader behavior
- transition logic
- scroll timing
- visual composition

Do not let CMS authors accidentally redesign cinematic scenes.

---

# 28. Project Relationship Graph

Projects should connect to services.

Services should connect to projects.

Insights may connect to both.

Conceptually:

```text
Service
 ↕
Project
 ↕
Insight
```

This creates natural internal linking.

---

# 29. Related Work Logic

Priority:

1. manually selected related projects
2. shared services
3. shared categories
4. recent relevant work

Manual relationships should override automatic matching.

---

# 30. Portfolio Index Filtering

Potential filters:

```text
All
Brand Identity
Illustration
Apparel
Logo Design
Corporate
```

Do not expose every internal category as a filter.

Keep the interface simple.

---

# 31. Portfolio Card Data

Card requires:

```text
title
slug
thumbnail
primaryCategory
year
optional accent
```

Avoid loading entire project bodies into the index route.

---

# 32. Case Study Copy Style

Copy should be:

- concise
- specific
- confident
- visually aware
- not agency-fluff-heavy

Avoid phrases like:

```text
We embarked on a transformative journey...
We leveraged innovative solutions...
```

Prefer actual project language.

---

# 33. Project Overview Formula

A strong project overview should answer:

1. Who was the client?
2. What did they need?
3. What did WestCose create?
4. What made the solution important?

---

# 34. Challenge Section

Describe the actual design problem.

Examples:

- inconsistent identity
- outdated logo
- multiple departments / schools
- poor production files
- need for scalable lockups
- need to work across embroidery, print, signage, digital

Avoid inventing business problems not supported by the project.

---

# 35. Results Section

Only state measurable results when evidence exists.

If hard metrics do not exist, use outcome language such as:

- unified identity system
- standardized production files
- expanded logo architecture
- consistent vendor assets
- scalable application system

Do not fabricate performance claims.

---

# 36. Greenfield Case Study

Greenfield should be a flagship feature case study.

Homepage Scene 03 is capability-led rather than client-led. It may use genuine approved Greenfield work as proof of Brand Development / Identity Systems, but the scene should not require visitors to recognize Greenfield or make the client name its primary subject.

Until genuine Greenfield source assets are supplied, use other approved portfolio work without attributing it to Greenfield. Never publish development placeholders as finished portfolio proof.

Likely content pillars:

```text
District identity
Logo architecture
School system
Typography
Color
Horizontal / vertical lockups
Production files
Stationery
Apparel
Brand standards
Rollout
```

The Homepage Brand Development scene can be more cinematic and selective.

The dedicated case study should be more complete and searchable.

---

# 37. Corporate / Healthcare Work

Corporate and healthcare work should demonstrate:

- trust
- clarity
- stationery
- formal identity applications
- consistency
- production readiness

Avoid over-stylizing these case studies in ways that undermine the seriousness of the work.

---

# 38. Apparel Work

Apparel project pages should support:

- front / back graphics
- left-chest systems
- hat graphics
- patch work
- product mockups
- illustration details
- production notes

---

# 39. Illustration Work

Illustration entries should support:

- final art
- sketch
- detail crop
- application
- color variants

The artwork should be allowed to dominate the page.

---

# 40. Content Status Workflow

Recommended statuses:

```text
Draft
Needs Assets
Needs Copy
Ready for Review
Approved
Published
```

Sanity draft / publish behavior can handle the core workflow.

---

# 41. Asset Preparation Workflow

Before entering a project into CMS:

1. collect source assets
2. remove duplicates
3. identify hero image
4. identify thumbnail
5. prepare web-friendly exports
6. write alt text
7. define project category
8. define related services
9. write summary
10. decide Feature vs Visual Project

---

# 42. Sanity Schema Folder Structure

Recommended:

```text
/sanity
  /schemaTypes
    project.ts
    service.ts
    insight.ts
    client.ts
    category.ts
    siteSettings.ts
    homepage.ts
    /objects
      seo.ts
      media.ts
      projectStats.ts
      imagePair.ts
      mediaGrid.ts
      colorPalette.ts
      typeSystem.ts
```

---

# 43. GROQ Query Strategy

Create centralized typed queries.

Recommended:

```text
projectsQuery
projectBySlugQuery
featuredProjectsQuery
servicesQuery
serviceBySlugQuery
insightsQuery
insightBySlugQuery
homepageQuery
siteSettingsQuery
```

Do not write large inline GROQ strings across random components.

---

# 44. Content Validation

Use Sanity schema validation for:

- required title
- unique slug
- required project type
- required summary
- image alt text where appropriate
- SEO title length guidance
- SEO description guidance

---

# 45. Preview / Draft Mode

Support preview for:

- project pages
- service pages
- insights
- homepage content

Editors should be able to review before publishing.

---

# 46. Search / Filtering

V1 does not require a full-site search engine.

Portfolio filtering can be client-side over server-loaded metadata if the project count remains reasonable.

If content grows significantly later, revisit search architecture.

---

# 47. Content Migration

Existing WordPress content should be mapped rather than bulk copied blindly.

Each current page should receive:

```text
PRESERVE
REWRITE
MERGE
RETIRE
```

Project content should be restructured into the new models.

---

# 48. CMS Non-Goals

Do not use Sanity for:

- animation timelines
- shader parameters
- arbitrary CSS
- layout coordinates
- scene pin durations
- runtime feature flags
- full visual page building

These belong in code.

---

# 49. Required Content Before Launch

Minimum:

- homepage copy
- core service pages
- studio / about
- process
- start-a-project
- contact
- portfolio index
- enough projects to demonstrate range
- at least one flagship feature case study
- Labs transition page
- Shop transition page
- SEO metadata
- footer / site settings

---

# 50. Locked Content Direction

- two project formats: Feature Case Study and Visual Project
- services use dedicated reference documents
- projects connect to services
- Sanity owns editable marketing / portfolio content
- animation remains in code
- `/portfolio` is the working asset source
- `/scenes` contains art-direction references
- `/illustrations` contains the Scene 1.5 artwork sequence
- Greenfield is a flagship case study
- corporate / healthcare work proves professional range
- apparel / illustration remain major differentiators
- project outcomes must remain factual
