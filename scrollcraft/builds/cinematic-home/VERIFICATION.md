# Cinematic homepage delivery

Preview: http://127.0.0.1:3001. Default Turbopack development remains at http://localhost:3000.

Implemented the approved connected-chapter direction in the existing Next.js, GSAP, Lenis and R3F application. The hero4 artwork and liquid-glass navigation are retained. Higgsfield generation was explicitly deferred by the user; the existing ten-second film remains the source. No deployment or purchases were made.

## Delivered behavior

- Local, licensed Manrope and Oswald fonts remove the Google font resolver dependency. Existing variables and weight ranges are preserved; font licenses and provenance are in `app/fonts`.
- The real WC vector traces, fills, holds and opens onto the hero. Fresh visits replay it; Skip, direct anchors, restored scroll and reduced motion are supported. A wall-clock cutoff releases the loader even if visual readiness stalls.
- Subdivided, lit paper surfaces carry the original artwork, with deterministic curvature and flutter. Desktop shows at most five foreground sheets; portrait uses at most three. The final Vested sheet resolves into the exact pixels and position of its receiving brand board.
- The illustration gallery, paper flight, identity construction line, curved sketchbook pages, stationery and orbit remain connected chapters. Desktop chapter targets total 21.4 viewport heights, plus any space needed by the inquiry form. Mobile galleries flow naturally.
- The video has responsive, silent H.264 delivery copies with a six-frame GOP and matching decoded posters. The original master is untouched. Paper rendering uses demand frames, bounded pixel density, nearby mounting and offscreen cleanup. Software rendering receives a smaller pixel budget.
- Reduced motion, data saving, video errors, denied WebGL and live context loss have static artwork layouts. Reduced transparency makes navigation opaque. The homepage skip target now accepts keyboard focus.

## Verification evidence

`npm run lint`, `npm run typecheck` and `npm run build` pass. Both default Turbopack development and production were exercised without the reported font build error.

The full visual pass captured six positions in every desktop chapter, plus portrait compositions. Subsequent focused passes rechecked the changed handoff, loader, media-error and WebGL paths. See `qa/desktop-contact-sheet.png`, `qa/mobile-contact-sheet.png`, `qa/paper-handoff-*.png` and `qa/opening-filled-mark.png`.

The automated interaction pass covers reverse scrolling, renderer exit/re-entry, decoded video, fresh visits, Skip, direct section links, mobile menu Escape, orientation changes, orbit inspection and dismissal. Inquiry validation, failure with answers retained, and success were tested with intercepted responses. No inquiry was sent.

Chrome, Firefox and WebKit ran without application page errors. Firefox and WebKit received targeted paper/sketchbook visual and overflow checks; they did not receive the entire Chrome interaction matrix. Browser Back, live context loss, reduced transparency, keyboard skip, delayed hero readiness and 320/768/1920px layouts are recorded separately in `qa/resilience-report.json`.

Performance was measured with native Chrome on Intel UHD Graphics, without recording. The final checked run reported 24.3 ms median frame spacing and 42.5 ms at the 95th percentile in the paper sequence, with no sampled frames above 50 ms. Initial measured layout shift was zero. The recording pass costs additional frame time; its timings are retained in `qa/report.json` rather than presented as normal browsing performance. This is not a claim of universal 60 fps.

## Visual review

The intended and observed sequence is intrigue, confidence, curiosity, immersion, clarity, craft, trust, possibility and readiness. The paper flight is the strongest visual change and has the largest scroll allocation. Review led to a quieter gallery backdrop, removal of counters/cursor decoration, larger paper, a matching foreground-to-board transfer, a cleaner portrait crop and the readable static layouts. The project brief remains a calm, usable ending.

The user selected connected chapters and preservation of all existing content; that decision takes precedence over replacing the site with another page grammar. This is the first entry in the local fingerprint registry. Its signature is the gallery print becoming dimensional paper, followed by the Vested paper becoming a working identity board.

## Artifacts and repeatability

- `qa/desktop-walkthrough.mp4` and `qa/mobile-walkthrough.mp4`: continuous automated scroll recordings.
- `qa/report.json` and `qa/resilience-report.json`: actual checks and measurements.
- `HIGGSFIELD-SHOT-BRIEF.md`: deferred production brief and reference storyboard.
- `public/experience/falling-studio/falling-scrub-desktop.mp4` and `falling-scrub-portrait.mp4`: current delivery footage.
- `falling-cinema-poster.webp` and `falling-cinema-portrait.webp`: corresponding posters.

Run `scripts/verify-cinematic-home.mjs` and `scripts/verify-cinematic-resilience.mjs` against a running production server. Set `PLAYWRIGHT_MODULE` to an available Playwright module and `QA_CHROME_CHANNEL=chrome` for the installed hardware-accelerated Chrome. `QA_URL` overrides port 3001. `scripts/record-cinematic-home.mjs` records the continuous walkthroughs; `scripts/encode-cinematic-media.mjs` rebuilds the delivery footage using `FFMPEG_PATH`.

QA captures are intentionally ignored by Git but remain in this local workspace.

## Remaining limits

A physical mobile device, actual Safari, touch inertia, iOS Low Power Mode and real-device video decoding have not been verified. Higgsfield footage remains deferred. Existing Shop and Labs navigation destinations still return the repository's existing 404 pages; the links and route behavior were preserved. Form delivery was mocked, not tested against the email provider.
