"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { clamp01, mix, phase } from "@/lib/home/cinematic-motion";

export function CorporateOrbitBridge() {
  const layer = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const overlay = layer.current;
    const source = document.querySelector<HTMLElement>(".wc-refined-corporate__letterhead-mark img");
    const corporate = document.querySelector<HTMLElement>("#scene-05");
    const orbit = document.querySelector<HTMLElement>("#scene-06");
    const mark = overlay?.querySelector("img");
    if (!overlay || !source || !corporate || !orbit || !mark) return;
    const media = gsap.matchMedia();
    media.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const render = (raw: number) => {
        const p = clamp01(raw);
        const travel = phase(p, 0, .86);
        const rect = source.getBoundingClientRect();
        const width = mix(rect.width, Math.min(innerHeight * .16, 160), travel);
        gsap.set(overlay, { autoAlpha: phase(p, 0, .07) * (1 - phase(p, .88, 1)) });
        gsap.set(mark, {
          x: mix(rect.left + rect.width / 2, innerWidth / 2, travel),
          y: mix(rect.top + rect.height / 2, innerHeight / 2, travel),
          scale: width / 160, rotationZ: (1 - travel) * -3,
          filter: `invert(${phase(p, .25, .8)})`,
          transformOrigin: "50% 50%",
        });
        source.style.opacity = p > .05 && p < 1 ? "0" : "1";
      };
      const trigger = ScrollTrigger.create({ trigger: corporate, start: () => `top+=${(corporate.offsetHeight - innerHeight) * .82} top`, endTrigger: orbit, end: "top top", onUpdate: self => render(self.progress), onRefresh: self => render(self.progress) });
      render(trigger.progress);
      return () => { trigger.kill(); gsap.set([overlay, mark], { clearProps: "all" }); source.style.removeProperty("opacity"); };
    });
    return () => media.revert();
  }, { scope: layer });
  return <div ref={layer} className="wc-corporate-orbit-mark" aria-hidden="true"><Image src="/brand/westcose-monogram.svg" width={160} height={166} alt="" /></div>;
}
