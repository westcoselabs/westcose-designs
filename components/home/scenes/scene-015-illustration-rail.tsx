import Image from "next/image";
import type { CSSProperties } from "react";

import { IllustrationRailMotion } from "@/components/home/motion/illustration-rail-motion";
import { SceneShell } from "@/components/home/scene-shell";
import { Container } from "@/components/layout/container";
import { ILLUSTRATION_ASSETS } from "@/lib/home/illustration-manifest";

type ArtworkStyle = CSSProperties & {
  "--wc-artwork-accent": string;
};

export function Scene015IllustrationRail() {
  return (
    <SceneShell
      sceneId="scene-01-5"
      className="wc-scene-illustrations"
      labelledBy="scene-01-5-title"
    >
      <IllustrationRailMotion>
        <Container className="wc-scene-illustrations__header" width="wide">
          <p className="wc-home-scene__label">Scene 01.5 / Illustration Rail</p>
          <h2 id="scene-01-5-title" className="wc-heading-2">
            Illustration in motion.
          </h2>
          <p className="wc-body">
            Four works move through one continuous visual sequence.
          </p>
        </Container>

        <div
          className="wc-scene-illustrations__viewport"
          data-illustration-viewport
        >
          <ol className="wc-scene-illustrations__track" data-illustration-track>
            {ILLUSTRATION_ASSETS.map((illustration) => {
              const style: ArtworkStyle = {
                "--wc-artwork-accent": illustration.accent,
              };

              return (
                <li
                  key={illustration.id}
                  className="wc-scene-illustrations__artwork"
                  style={style}
                  data-illustration-item={illustration.id}
                  data-illustration-order={illustration.order}
                  data-accent={illustration.accent}
                >
                  <figure
                    className="wc-scene-illustrations__plane"
                    data-illustration-plane
                  >
                    <div className="wc-scene-illustrations__image">
                      <Image
                        src={illustration.src}
                        width={illustration.width}
                        height={illustration.height}
                        sizes="(max-width: 767px) 74vw, (max-width: 1279px) 52vw, 38vw"
                        alt={illustration.alt}
                      />
                    </div>

                    <figcaption className="wc-scene-illustrations__metadata">
                      <span className="wc-scene-illustrations__number">
                        {String(illustration.order).padStart(2, "0")}
                      </span>
                      <span className="wc-scene-illustrations__identity">
                        <strong>{illustration.title}</strong>
                        <span>{illustration.category}</span>
                      </span>
                    </figcaption>
                  </figure>
                </li>
              );
            })}
          </ol>
        </div>

        <div
          className="wc-scene-illustrations__handoff"
          data-illustration-handoff
          aria-hidden="true"
        >
          <span />
        </div>
      </IllustrationRailMotion>
    </SceneShell>
  );
}
