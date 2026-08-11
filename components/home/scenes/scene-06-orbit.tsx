import Image from "next/image";
import Link from "next/link";

import { EcosystemOrbitRuntime } from "@/components/home/motion/ecosystem-orbit-runtime";
import { SceneShell } from "@/components/home/scene-shell";
import { Container } from "@/components/layout/container";
import { ORBIT_WORLDS } from "@/lib/home/orbit-worlds";

export function Scene06Orbit() {
  return (
    <SceneShell
      sceneId="scene-06"
      className="wc-scene-orbit"
      labelledBy="scene-06-title"
    >
      <Container className="wc-scene-orbit__layout" width="wide">
        <EcosystemOrbitRuntime>
          <div className="wc-scene-orbit__receiver" aria-hidden="true">
            <span className="wc-scene-orbit__receiver-grid" />
            <span className="wc-scene-orbit__receiver-ellipse" data-axis="x" />
            <span className="wc-scene-orbit__receiver-ellipse" data-axis="y" />
            <span className="wc-scene-orbit__receiver-axis" data-axis="x" />
            <span className="wc-scene-orbit__receiver-axis" data-axis="y" />
          </div>

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
                <Link
                  key={world.id}
                  className="wc-scene-orbit__fallback-world"
                  href={world.href}
                  data-world={world.id}
                  data-orbit-world={world.id}
                  data-visual={world.visual}
                  aria-label={`Open ${world.label}`}
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
                </Link>
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

            <nav
              className="wc-scene-orbit__destinations"
              aria-label="WestCose destinations"
            >
              <ul>
                {ORBIT_WORLDS.map((world, index) => (
                  <li key={world.id} data-world={world.id}>
                    <Link
                      className="wc-scene-orbit__node"
                      href={world.href}
                      data-orbit-world={world.id}
                      aria-labelledby={`${world.id}-label`}
                      aria-describedby={`${world.id}-disciplines ${world.id}-summary`}
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
                        Enter
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </EcosystemOrbitRuntime>
      </Container>

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
