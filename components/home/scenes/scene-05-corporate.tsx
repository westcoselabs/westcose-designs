import Image from "next/image";

import { CorporateSceneMotion } from "@/components/home/motion/corporate-scene-motion";
import { SceneShell } from "@/components/home/scene-shell";
import { Container } from "@/components/layout/container";

export function Scene05Corporate() {
  return (
    <SceneShell
      sceneId="scene-05"
      className="wc-scene-corporate wc-scene-corporate--refined"
      labelledBy="scene-05-title"
    >
      <CorporateSceneMotion>
        <div className="wc-refined-corporate">
          <Container className="wc-refined-corporate__layout" width="wide">
            <header
              className="wc-refined-corporate__copy"
              data-corporate-copy
            >
              <p className="wc-home-scene__label">
                Scene 05 / Corporate Identity
              </p>
              <h2 id="scene-05-title" className="wc-heading-1">
                Systems that earn trust.
              </h2>
              <p className="wc-body">
                Clear identity systems for organizations that need credibility
                without losing character.
              </p>
              <span className="wc-refined-corporate__spec" aria-hidden="true">
                Structure / hierarchy / consistency
              </span>
            </header>

            <div
              className="wc-refined-corporate__system"
              data-corporate-system
              aria-hidden="true"
            >
              <div
                className="wc-refined-corporate__construction"
                data-corporate-grid
              >
                <span data-corporate-grid-axis="x" />
                <span data-corporate-grid-axis="y" />
                <i>01 / 04</i>
                <b>Identity field</b>
              </div>

              <article
                className="wc-refined-corporate__piece wc-refined-corporate__letterhead"
                data-corporate-piece="letterhead"
              >
                <div className="wc-refined-corporate__letterhead-mark">
                  <Image
                    src="/brand/westcose-monogram.svg"
                    width={48}
                    height={48}
                    alt=""
                  />
                  <span>WestCose</span>
                </div>
                <div className="wc-refined-corporate__letterhead-lines">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <small>Office of design systems</small>
              </article>

              <article
                className="wc-refined-corporate__piece wc-refined-corporate__card"
                data-corporate-piece="card"
              >
                <Image
                  src="/brand/westcose-monogram.svg"
                  width={56}
                  height={56}
                  alt=""
                />
                <span>Design with character.</span>
                <small>westcose.com</small>
              </article>

              <article
                className="wc-refined-corporate__piece wc-refined-corporate__presentation"
                data-corporate-piece="presentation"
              >
                <span>Identity standards</span>
                <strong>01</strong>
                <small>Core system / 2026</small>
              </article>

              <article
                className="wc-refined-corporate__piece wc-refined-corporate__memo"
                data-corporate-piece="memo"
              >
                <span>Brand architecture</span>
                <div>
                  <i />
                  <i />
                  <i />
                </div>
                <small>Grid study 04</small>
              </article>

              <span
                className="wc-refined-corporate__settle-mark"
                data-corporate-settle-mark
              />

              <span className="wc-refined-corporate__pen" data-corporate-pen>
                <i />
              </span>
            </div>
          </Container>

          <div className="wc-refined-corporate__dusk" data-corporate-dusk>
            <div
              className="wc-refined-corporate__orbit-bridge"
              data-corporate-orbit-bridge
              aria-hidden="true"
            >
              <span data-corporate-arc="outer" />
              <span data-corporate-arc="middle" />
              <span data-corporate-arc="inner" />
              <Image
                className="wc-refined-corporate__orbit-mark"
                data-corporate-orbit-mark
                src="/brand/westcose-monogram.svg"
                width={180}
                height={180}
                alt=""
              />
            </div>
          </div>
        </div>
      </CorporateSceneMotion>
    </SceneShell>
  );
}
