import Image from "next/image";
import type { CSSProperties } from "react";

import { BrandDevelopmentSceneMotion } from "@/components/home/motion/brand-development-scene-motion";
import { SceneShell } from "@/components/home/scene-shell";
import { Container } from "@/components/layout/container";
import { BRAND_DEVELOPMENT_BEATS } from "@/lib/home/brand-development-manifest";

type BeatStyle = CSSProperties & {
  "--wc-brand-accent": string;
};

export function Scene03Greenfield() {
  return (
    <SceneShell
      sceneId="scene-03"
      className="wc-scene-greenfield wc-scene-brand-development"
      labelledBy="scene-03-title"
    >
      <BrandDevelopmentSceneMotion>
        <Container className="wc-scene-greenfield__layout" width="wide">
          <div
            className="wc-scene-greenfield__copy"
            data-brand-development-intro
          >
            <p className="wc-home-scene__label">
              Scene 03 / Brand Development / Identity Systems
            </p>
            <h2 id="scene-03-title" className="wc-heading-1">
              A logo is only the start.
            </h2>
            <p className="wc-body">
              Identity becomes useful when every choice works together, from
              the first mark to the system people recognize in the world.
            </p>
          </div>

          <ol
            className="wc-brand-development__nav"
            aria-label="Identity system stages"
          >
            {BRAND_DEVELOPMENT_BEATS.map((beat) => (
              <li key={beat.id} data-brand-development-nav>
                <span>{String(beat.order).padStart(2, "0")}</span>
                {beat.label}
              </li>
            ))}
          </ol>

          <div
            className="wc-brand-development__visual"
            aria-label="Brand development examples from selected projects"
          >
            {BRAND_DEVELOPMENT_BEATS.map((beat) => (
              <article
                key={beat.id}
                className="wc-brand-development__beat"
                data-brand-development-beat={beat.id}
                style={
                  {
                    "--wc-brand-accent": beat.accent,
                  } as BeatStyle
                }
              >
                <figure>
                  <div className="wc-brand-development__media">
                    <Image
                      src={beat.src}
                      width={beat.width}
                      height={beat.height}
                      sizes="(max-width: 767px) 92vw, (max-width: 1279px) 60vw, 54vw"
                      alt={beat.alt}
                      loading="lazy"
                    />
                  </div>
                  <figcaption>
                    <span className="wc-brand-development__beat-number">
                      {String(beat.order).padStart(2, "0")} / 06
                    </span>
                    <div>
                      <p>{beat.project}</p>
                      <h3>{beat.title}</h3>
                      <small>{beat.detail}</small>
                    </div>
                  </figcaption>
                </figure>
              </article>
            ))}
          </div>
        </Container>

        <div
          className="wc-brand-development__exit-line"
          data-brand-development-exit-line
          aria-hidden="true"
        >
          <span data-line-material="vector" />
          <span data-line-material="graphite" />
        </div>
      </BrandDevelopmentSceneMotion>
    </SceneShell>
  );
}
