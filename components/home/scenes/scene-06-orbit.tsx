import Image from "next/image";
import Link from "next/link";

import { EcosystemOrbitRuntime } from "@/components/home/motion/ecosystem-orbit-runtime";
import { SceneShell } from "@/components/home/scene-shell";
import { ORBIT_WORLDS } from "@/lib/home/orbit-worlds";

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
                data-visual={world.visual}
                aria-label={`Inspect ${world.label}`}
                aria-haspopup="dialog"
                aria-controls="orbit-world-inspector"
              >
                {"textureSrc" in world ? (
                  <Image
                    src={world.textureSrc}
                    alt=""
                    width={world.id === "designs" ? 1350 : 1080}
                    height={world.id === "designs" ? 1080 : 1080}
                    sizes="(max-width: 1023px) 28vw, 11rem"
                    unoptimized={world.textureSrc.endsWith(".svg")}
                  />
                ) : (
                  <span className="wc-scene-orbit__interface-glyph">
                    <i />
                    <i />
                    <i />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="wc-scene-orbit__editorial">
          <div className="wc-scene-orbit__copy">
            <p className="wc-home-scene__label">
              Scene 06 / WestCose Ecosystem
            </p>
            <h2 id="scene-06-title" className="wc-heading-1">
              One signal. Three worlds.
            </h2>
            <p className="wc-body">
              Design, digital products, and goods connected by one independent
              creative philosophy.
            </p>
          </div>

          <div
            className="wc-scene-orbit__destinations"
            role="group"
            aria-label="WestCose worlds"
          >
            <ul>
              {ORBIT_WORLDS.map((world, index) => (
                <li key={world.id} data-world={world.id}>
                  <button
                    type="button"
                    className="wc-scene-orbit__node"
                    data-orbit-world={world.id}
                    aria-labelledby={`${world.id}-label`}
                    aria-describedby={`${world.id}-disciplines ${world.id}-summary`}
                    aria-haspopup="dialog"
                    aria-controls="orbit-world-inspector"
                  >
                    <span
                      className="wc-scene-orbit__node-number"
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      id={`${world.id}-label`}
                      className="wc-scene-orbit__node-label"
                    >
                      {world.label}
                    </span>
                    <span
                      id={`${world.id}-disciplines`}
                      className="wc-scene-orbit__node-disciplines"
                    >
                      {world.disciplines}
                    </span>
                    <span
                      id={`${world.id}-summary`}
                      className="wc-scene-orbit__node-summary"
                    >
                      {world.summary}
                    </span>
                    <span
                      className="wc-scene-orbit__node-action"
                      aria-hidden="true"
                    >
                      Inspect
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
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
