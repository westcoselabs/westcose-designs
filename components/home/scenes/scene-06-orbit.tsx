import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { EcosystemOrbitRuntime } from "@/components/home/motion/ecosystem-orbit-runtime";
import { SceneShell } from "@/components/home/scene-shell";
import { StudioArt, StudioTransitionCopy } from "@/components/home/scenes/scene-05-studio";
import { DestinationCard } from "@/components/ui/destination-card";
import { DisplayHeading, Eyebrow, Lede, MetaLabel } from "@/components/ui/typography";
import { ORBIT_BRIDGE_SCALE, ORBIT_WORLDS } from "@/lib/home/orbit-worlds";

export function Scene06Orbit() {
  return (
    <SceneShell
      sceneId="scene-06"
      className="wc-scene-orbit"
      labelledBy="scene-06-title"
    >
      <EcosystemOrbitRuntime>
        <div className="wc-scene-orbit__fallback">
          <div className="wc-scene-orbit__tracks" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div className="wc-scene-orbit__core" aria-hidden="true">
            <Image
              src="/brand/westcose-monogram.svg"
              alt=""
              width={640}
              height={640}
              unoptimized
            />
          </div>

          <div className="wc-scene-orbit__fallback-worlds">
            {ORBIT_WORLDS.map((world) => (
              <button
                key={world.id}
                type="button"
                className="wc-scene-orbit__fallback-world"
                data-world={world.id}
                data-orbit-world={world.id}
                data-orbit-trigger
                data-visual={world.visual}
                aria-label={`Inspect ${world.label}`}
                aria-haspopup="dialog"
                aria-controls="orbit-world-inspector"
              >
                <Image
                  src={world.previewSrc}
                  alt=""
                  width={640}
                  height={640}
                  sizes="(max-width: 1023px) 40vw, 25vw"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Opening frame twin of the studio's last frame; the runtime carries it into orbit. */}
        <StudioArt
          className="wc-scene-orbit__bridge-art"
          data-orbit-bridge-art
          style={{ "--wc-bridge-scale": ORBIT_BRIDGE_SCALE } as CSSProperties}
        />
        <StudioTransitionCopy className="wc-scene-orbit__bridge-copy" aria-hidden="true" />

        <div className="wc-scene-orbit__editorial">
          <div className="wc-scene-orbit__copy">
            <Eyebrow mark={null}>Three destinations / One WestCose</Eyebrow>
            <DisplayHeading id="scene-06-title" lines={["Explore", "WestCose."]} />
            <Lede>Browse the portfolio, explore websites and development, or shop official WestCose merch.</Lede>
          </div>

          <div
            className="wc-scene-orbit__destinations"
            role="group"
            aria-label="WestCose worlds"
          >
            <ul>
              {ORBIT_WORLDS.map((world) => (
                <DestinationCard
                  key={world.id}
                  data-world={world.id}
                  data-orbit-world={world.id}
                  title={world.label}
                  description={world.summary}
                  href={world.href}
                  actionLabel={world.cardLabel}
                  actionSymbol={world.id === "designs" ? "→" : "↗"}
                  // Designs keeps the studio's warm glass; Labs and Shop wear their planet's light.
                  accent={world.id === "designs" ? undefined : world.accent}
                  previewAction={{
                    "aria-label": `Inspect ${world.label}`,
                    "aria-haspopup": "dialog",
                    "aria-controls": "orbit-world-inspector",
                    ...{ "data-orbit-trigger": "", "data-orbit-world": world.id },
                  }}
                />
              ))}
            </ul>
          </div>
          <MetaLabel className="wc-scene-orbit__helper">Click a planet for details. Use a card to visit.</MetaLabel>
        </div>
      </EcosystemOrbitRuntime>

      <div className="wc-scene-orbit__handoff">
        <Image
          src="/brand/westcose-monogram.svg"
          alt=""
          width={640}
          height={640}
          unoptimized
        />
        <div className="wc-scene-orbit__handoff-copy">
          <p>THE NEXT THING DOESN&rsquo;T EXIST YET.</p>
          <Link href="#scene-07" className="wc-scene-orbit__start">
            Start
          </Link>
        </div>
      </div>
    </SceneShell>
  );
}
