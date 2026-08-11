import Image from "next/image";
import type { CSSProperties } from "react";

import { SketchbookSceneMotion } from "@/components/home/motion/sketchbook-scene-motion";
import { SceneShell } from "@/components/home/scene-shell";
import { Container } from "@/components/layout/container";
import { SKETCHBOOK_ASSETS } from "@/lib/home/sketchbook-manifest";

type SketchbookPageStyle = CSSProperties & {
  "--wc-sketchbook-accent": string;
  "--wc-sketchbook-page-order": number;
};

export function Scene04Sketchbook() {
  return (
    <SceneShell
      sceneId="scene-04"
      className="wc-scene-sketchbook wc-scene-sketchbook--refined"
      labelledBy="scene-04-title"
    >
      <SketchbookSceneMotion>
        <div className="wc-refined-sketchbook">
          <div
            className="wc-refined-sketchbook__material-line"
            data-sketchbook-material-line
            aria-hidden="true"
          >
            <span data-line-material="vector" />
            <span data-line-material="graphite" />
            <i />
          </div>

          <Container className="wc-refined-sketchbook__layout" width="wide">
            <header
              className="wc-refined-sketchbook__intro"
              data-sketchbook-intro
            >
              <p className="wc-home-scene__label">Scene 04 / The Sketchbook</p>
              <h2 id="scene-04-title" className="wc-heading-1">
                Ideas start dirty.
              </h2>
              <p className="wc-body">
                Rough lines become memorable work one deliberate page at a
                time.
              </p>
            </header>

            <div className="wc-refined-sketchbook__book" data-sketchbook-book>
              <div
                className="wc-refined-sketchbook__inside-cover"
                aria-hidden="true"
              >
                <span />
                <span />
                <small>WestCose field book</small>
              </div>

              <ol
                className="wc-refined-sketchbook__pages"
                aria-label="Selected illustration work"
              >
                {SKETCHBOOK_ASSETS.map((asset, index) => {
                  const style: SketchbookPageStyle = {
                    "--wc-sketchbook-accent": asset.accent,
                    "--wc-sketchbook-page-order":
                      SKETCHBOOK_ASSETS.length - index,
                  };

                  return (
                    <li
                      key={asset.id}
                      className="wc-refined-sketchbook__page"
                      style={style}
                      data-sketchbook-page={asset.id}
                      data-page-index={index}
                    >
                      <article className="wc-refined-sketchbook__page-face wc-refined-sketchbook__page-front">
                        <span
                          className="wc-refined-sketchbook__registration"
                          aria-hidden="true"
                        />
                        <span
                          className="wc-refined-sketchbook__tape"
                          aria-hidden="true"
                        />

                        <figure className="wc-refined-sketchbook__figure">
                          <div
                            className="wc-refined-sketchbook__artwork"
                            data-sketchbook-artwork
                          >
                            <Image
                              src={asset.src}
                              width={asset.width}
                              height={asset.height}
                              sizes="(max-width: 767px) 88vw, (max-width: 1279px) 48vw, 38vw"
                              alt={asset.alt}
                            />
                            <span
                              className="wc-refined-sketchbook__ink-mask"
                              data-sketchbook-ink-mask
                              aria-hidden="true"
                            />
                          </div>

                          <figcaption className="wc-refined-sketchbook__caption">
                            <span>{String(asset.order).padStart(2, "0")}</span>
                            <strong>{asset.title}</strong>
                            <small>{asset.category}</small>
                          </figcaption>
                        </figure>

                        {asset.annotation ? (
                          <span
                            className="wc-refined-sketchbook__annotation"
                            data-sketchbook-annotation
                            aria-hidden="true"
                          >
                            {asset.annotation}
                          </span>
                        ) : (
                          <span
                            className="wc-refined-sketchbook__annotation-line"
                            data-sketchbook-annotation
                            aria-hidden="true"
                          />
                        )}
                      </article>

                      <div
                        className="wc-refined-sketchbook__page-face wc-refined-sketchbook__page-back"
                        aria-hidden="true"
                      >
                        <span />
                      </div>
                    </li>
                  );
                })}
              </ol>

              <span
                className="wc-refined-sketchbook__spine"
                aria-hidden="true"
              />
              <span
                className="wc-refined-sketchbook__page-shadow"
                data-sketchbook-page-shadow
                aria-hidden="true"
              />
            </div>
          </Container>

          <div
            className="wc-refined-sketchbook__white-breath"
            data-sketchbook-white-breath
            aria-hidden="true"
          >
            <span
              className="wc-refined-sketchbook__exit-grid"
              data-sketchbook-exit-grid
            />
            <span className="wc-refined-sketchbook__pen" data-sketchbook-pen>
              <i />
            </span>
          </div>
        </div>
      </SketchbookSceneMotion>
    </SceneShell>
  );
}
