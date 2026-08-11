# WestCose Designs — SEO Migration & URL Strategy

**Document Type:** SEO Migration / Information Architecture / Launch Protection  
**Project:** WestCose Designs Website Redesign  
**Primary Domain:** `westcosedesigns.com`  
**Status:** Required Pre-Launch Specification  
**Related Docs:**  
- `01-westcose-designs-project-scope-company-breakdown.md`
- `02-westcose-designs-technical-architecture-app-stack-mcps-dependencies.md`
- `03-westcose-designs-homepage-scenes-transitions-animation-spec.md`

---

# 1. Purpose

This document defines how WestCose Designs should migrate from the existing WordPress site to the new Next.js application **without unnecessarily sacrificing existing search authority, indexed URLs, backlinks, or topical relevance**.

The migration is both:

1. a platform migration, and
2. a structural redesign.

The project should **not** combine those changes with an unnecessary primary-domain migration.

The working rule is:

> **Keep `westcosedesigns.com` as the primary design-studio domain and preserve valuable URLs whenever practical.**

---

# 2. Primary SEO Objectives

The migration should:

- preserve valuable existing rankings,
- preserve backlink equity,
- preserve indexed pages with meaningful search value,
- improve page quality and information architecture,
- create dedicated service landing pages,
- strengthen case-study depth,
- improve internal linking,
- improve technical SEO,
- improve performance,
- and expand topical authority around WestCose's highest-value design services.

---

# 3. Migration Principle

Every existing indexable URL must receive one explicit migration decision:

```text
KEEP
REBUILD
MERGE
REDIRECT
REMOVE
```

No meaningful URL should disappear accidentally.

Do not use a blanket rule such as:

```text
old page → homepage
```

Each old URL should map to the most semantically relevant destination.

---

# 4. Pre-Migration Inventory

Before implementation reaches launch readiness, create a complete inventory of the existing WordPress site.

Sources should include:

- WordPress sitemap(s)
- Google Search Console
- analytics
- current navigation
- current portfolio pages
- current service pages
- manually discovered landing pages
- backlink data when available
- indexed URLs found through search
- images or assets that receive meaningful traffic

---

# 5. Migration Matrix

Maintain a working migration spreadsheet or CSV.

Recommended fields:

| Field | Purpose |
|---|---|
| Current URL | Existing WordPress URL |
| Page Type | Service, portfolio, article, utility, etc. |
| Current Title | Existing title tag |
| Current Meta Description | Existing description |
| Primary Topic | Main subject |
| Search Intent | What the page satisfies |
| Organic Traffic | Relative importance |
| Backlinks | Whether external links exist |
| Indexed | Yes / No |
| New URL | Destination in Next.js |
| Action | KEEP / REBUILD / MERGE / REDIRECT / REMOVE |
| Redirect Type | Usually 301 |
| New Title | Proposed metadata |
| New Description | Proposed metadata |
| Content Notes | Preserve / expand / rewrite |
| Status | Planned / built / QA / launched |

Store the finalized export under:

```text
/seo/legacy-urls.csv
```

---

# 6. Known Existing URL Considerations

The current redesign planning has already identified several useful existing URL patterns.

Examples include:

```text
/logo-design/
/website-design/
/portfolio/
```

These should be audited before changing them.

## `/logo-design/`

Likely action:

```text
KEEP or REBUILD
```

Reason:

Logo design remains a core WestCose service and a strong search-intent page.

Recommended future route:

```text
/services/logo-design/
```

However, if `/logo-design/` already has meaningful traffic or backlinks, consider **retaining the existing path** instead of changing it solely for architectural neatness.

SEO value should take priority over a prettier URL hierarchy.

---

## `/website-design/`

WestCose Designs is moving software and web-development positioning toward WestCose Labs.

Do not delete this URL casually.

Possible migration strategies:

### Option A — Keep as a bridge page

```text
/website-design/
```

Remains indexable and explains that web / software work now lives under WestCose Labs.

Best if the existing page has meaningful traffic, rankings, or backlinks.

### Option B — Redirect

If the page has little independent value and Labs has a semantically strong replacement:

```text
/website-design/
→ Labs equivalent
```

Only use this after confirming the Labs destination exists and is appropriate.

---

## `/portfolio/`

Likely action:

```text
KEEP or REBUILD
```

Potential future route:

```text
/work/
```

But do not redirect `/portfolio/` to `/work/` simply for naming preference if `/portfolio/` already performs well.

Either:

- retain `/portfolio/` as the canonical portfolio index,
- or migrate deliberately with a permanent redirect and complete internal-link update.

---

# 7. Recommended New Site Architecture

Working SEO-oriented routes:

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

These are architectural targets, not reasons to discard valuable legacy paths.

---

# 8. URL Preservation Rules

## Preserve an Existing URL When

- it ranks,
- it receives meaningful traffic,
- it has backlinks,
- it is already semantically clean,
- or changing it provides little practical benefit.

## Change a URL When

- the current URL is misleading,
- the content is being consolidated,
- the route no longer matches the site's purpose,
- or the new architecture provides a materially better long-term structure.

If changed:

- issue a permanent redirect,
- update all internal links,
- update sitemap references,
- update canonicals,
- update structured data,
- and verify the redirect after deployment.

---

# 9. Redirect Rules

Use permanent redirects for true migrations.

Recommended:

```text
301 / permanent redirect
```

Avoid redirect chains:

```text
A → B → C
```

Prefer:

```text
A → C
```

Avoid redirect loops.

Avoid redirecting unrelated pages to the homepage.

Avoid leaving valuable legacy URLs as soft 404s.

---

# 10. Redirect Storage

Recommended repository structure:

```text
/seo
  legacy-urls.csv
  redirects.ts
  migration-audit.md
```

Redirects may be implemented through:

- `next.config.ts`
- edge routing
- or another centralized Next.js redirect system

Keep redirect logic readable and version-controlled.

---

# 11. Service Page SEO Strategy

Each primary service should have a dedicated landing page.

Core pages:

```text
Brand Identity
Logo Design
Illustration
Apparel Design
Brand Development
Corporate Collateral
```

Each service page should include:

1. clear H1
2. strong introduction
3. what the service includes
4. who it is for
5. selected related work
6. process
7. common deliverables
8. related services
9. FAQ where genuinely useful
10. project CTA

Do not create thin SEO pages with near-duplicate copy.

---

# 12. Service → Work → Service Internal Linking

The site should intentionally connect services and proof.

Pattern:

```text
SERVICE
↓
FEATURED PROJECT
↓
RELATED CAPABILITY
↓
ANOTHER PROJECT
↓
START A PROJECT
```

Example:

```text
/services/brand-identity/
        ↓
/work/greenfield-union-school-district/
        ↓
/services/logo-design/
/services/corporate-collateral/
```

This improves both usability and topical relationships.

---

# 13. Case Study SEO Strategy

Feature case studies should include substantial HTML content.

Do not rely on motion, images, or canvas alone.

Recommended searchable content:

- project title
- client / organization
- project overview
- challenge
- creative direction
- services
- identity explanation
- deliverables
- application details
- outcome / result
- related projects
- related services

Visual storytelling can sit above and around this content.

---

# 14. Visual Project SEO Strategy

Smaller project entries can be shorter but should still include:

```text
Title
Client
Year
Category
Short summary
Services
Alt text
Related work
CTA
```

Avoid portfolio pages that are only a gallery with no meaningful text.

---

# 15. Metadata Strategy

Use Next.js metadata APIs.

Each indexable page should define:

- title
- meta description
- canonical URL
- Open Graph title
- Open Graph description
- Open Graph image
- Twitter image / card where appropriate

Titles should communicate subject clearly before brand decoration.

Example structure:

```text
Brand Identity Design in Bakersfield | WestCose Designs
```

Do not force location wording onto pages where it does not match intent.

---

# 16. Canonical Strategy

Every indexable page should output a self-referencing canonical unless there is a deliberate reason not to.

Canonical URLs should:

- use HTTPS
- use one hostname format consistently
- avoid duplicate query-string canonicals
- match the public production URL
- remain stable

---

# 17. Structured Data

Recommended schema types:

## Site Level

- Organization
- WebSite
- BreadcrumbList

## Service / Studio

Use an appropriate business/service schema where accurate.

Do not misuse LocalBusiness simply because the studio has a physical location.

## Project Pages

Consider:

- CreativeWork

## Insight Pages

- Article

All structured data must reflect visible page content.

---

# 18. Sitemap Strategy

Create a generated sitemap through Next.js.

Include canonical indexable routes only.

Likely groups:

```text
core pages
service pages
project pages
insight pages
```

Exclude:

- redirects
- preview routes
- staging pages
- utility endpoints
- noncanonical duplicates

---

# 19. Robots Strategy

Production:

- allow normal crawling
- reference sitemap
- block only routes that should not be indexed

Preview / staging:

- prevent indexing
- no accidental public staging index

Do not deploy production with a lingering global `noindex`.

---

# 20. Image SEO

For meaningful portfolio imagery:

- descriptive file names when practical
- accurate alt text
- width and height attributes
- modern image formats
- responsive image sizing
- no keyword stuffing

Alt text should describe the visible work and purpose.

Decorative cinematic textures can use empty alt attributes where appropriate.

---

# 21. Heading Structure

Each page should have one logical H1.

Subsections should use semantic hierarchy.

Do not choose heading tags based only on visual size.

Animation must not split important headings into inaccessible duplicated fragments.

If words are wrapped for animation, preserve accessible readable text.

---

# 22. Homepage SEO

The cinematic homepage should still contain:

- a crawlable H1
- descriptive studio copy
- service links
- selected work links
- meaningful project text
- studio context
- contact CTA

Shaders and WebGL should enhance the homepage, not become the only content.

---

# 23. Labs and Shop Transition Pages

The Designs domain should include lightweight transition pages:

```text
/westcose-labs
/shop
```

These pages can:

- explain the destination,
- preserve ecosystem context,
- provide descriptive text,
- and then link externally.

This is preferable to hiding the ecosystem behind unlabeled external links only.

---

# 24. WordPress Content Migration

Do not migrate every old paragraph automatically.

Classify content:

```text
PRESERVE
REWRITE
MERGE
RETIRE
```

Preserve factual project details and high-performing topics.

Rewrite weak or outdated presentation.

Merge duplicate or thin pages carefully.

Retire only when the content has no continuing value.

---

# 25. Launch-Day SEO Checklist

Before DNS / production cutover:

- all planned routes exist
- legacy redirect map implemented
- redirect chains checked
- canonicals correct
- titles correct
- meta descriptions present
- sitemap generated
- robots correct
- structured data validates
- key portfolio pages have crawlable HTML
- no accidental `noindex`
- no broken internal links
- image alt text reviewed
- 404 page works
- HTTPS works
- correct domain variant resolves
- analytics active
- Search Console access confirmed

---

# 26. Immediate Post-Launch Checklist

After launch:

1. Submit / verify sitemap.
2. Test key legacy URLs manually.
3. Inspect top pages in Search Console.
4. Check server logs / analytics for 404s.
5. Check indexing status.
6. Verify canonical URLs.
7. Monitor Core Web Vitals.
8. Monitor organic landing pages.
9. Fix accidental redirect or crawl issues immediately.

---

# 27. 30-Day Monitoring

Monitor:

- indexed page count
- impressions
- clicks
- ranking changes
- 404s
- redirect errors
- crawl issues
- Core Web Vitals
- traffic to key service pages
- traffic to feature case studies

Do not panic over normal short-term fluctuation.

Focus on clear technical errors first.

---

# 28. 90-Day Expansion

Once migration stabilizes:

- improve service copy
- add more case studies
- publish high-value insights
- strengthen internal links
- add FAQs where useful
- expand project descriptions
- evaluate location-specific opportunities
- identify search queries already generating impressions

---

# 29. SEO Guardrails

Do not:

- change domain and platform simultaneously without a compelling reason
- redirect everything to the homepage
- remove indexed service pages without mapping them
- hide important copy inside canvas
- publish dozens of thin keyword pages
- duplicate nearly identical service pages
- depend on client-only rendering for essential SEO content
- use motion as a substitute for information
- launch without testing redirects

---

# 30. Required Migration Deliverable

Before launch, this project must contain a completed migration matrix.

Minimum required output:

```text
Current URL
→ New URL
→ Action
→ Redirect
→ Status
```

The build is **not launch-ready** until the legacy URL inventory has been reviewed.

---

# 31. Locked SEO Direction

- `westcosedesigns.com` remains the primary design domain.
- Existing search authority should be protected.
- Valuable URLs should remain stable where practical.
- Service pages should expand topical coverage.
- Feature case studies should contain meaningful crawlable content.
- `/website-design/` requires deliberate handling because web/software positioning is moving to Labs.
- Redirects should map to semantically equivalent destinations.
- SEO content must remain accessible without animation or WebGL.
- Migration QA is a required launch phase.
