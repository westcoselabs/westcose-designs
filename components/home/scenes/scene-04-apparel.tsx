import {
  Megaphone,
  Package,
  Palette,
  PenNib,
  Ruler,
  Stack,
  TShirt,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

import { ApparelMixer } from "@/components/home/apparel/apparel-mixer";
import { ApparelSceneMotion } from "@/components/home/motion/apparel-scene-motion";
import { SceneShell } from "@/components/home/scene-shell";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Chip } from "@/components/ui/chip";
import { GlassCard } from "@/components/ui/glass-panel";
import { IconBadge } from "@/components/ui/icon-badge";
import {
  DisplayHeading,
  Eyebrow,
  Lede,
  MetaLabel,
} from "@/components/ui/typography";
import { APPAREL_EXPERTISE, APPAREL_KIT } from "@/lib/home/apparel-manifest";

const KIT_ICONS: Record<(typeof APPAREL_KIT)[number]["icon"], Icon> = {
  pen: PenNib,
  stack: Stack,
  shirt: TShirt,
  palette: Palette,
  megaphone: Megaphone,
  ruler: Ruler,
};

export function Scene04Apparel() {
  return (
    <SceneShell
      sceneId="scene-04"
      className="wc-scene-apparel"
      labelledBy="scene-04-title"
    >
      <ApparelSceneMotion>
        <div className="wc-apparel">
          <header className="wc-apparel__intro" data-apparel-reveal>
            <Eyebrow className="wc-apparel__eyebrow">
              Service 03 — Graphic apparel
            </Eyebrow>
            <DisplayHeading
              id="scene-04-title"
              size="section"
              lines={["Built to", "Be worn."]}
            />
            <Lede className="wc-apparel__description">
              Original tee graphics drawn in-house, then prepped for screen
              print or DTF. We take a design from napkin sketch to print-ready
              files, so it hits as hard on cotton as it did on screen.
            </Lede>
          </header>

          <section
            className="wc-apparel__expertise"
            aria-labelledby="scene-04-expertise"
            data-apparel-reveal
          >
            <MetaLabel as="h3" id="scene-04-expertise">
              What we bring
            </MetaLabel>
            <ol className="wc-apparel__expertise-list">
              {APPAREL_EXPERTISE.map(({ title, detail }, index) => (
                <li key={title}>
                  <span className="wc-apparel__expertise-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <strong>{title}</strong>
                  <span className="wc-apparel__expertise-detail">{detail}</span>
                </li>
              ))}
            </ol>
          </section>

          <div className="wc-apparel__cta-wrap" data-apparel-reveal>
            <ArrowLink className="wc-apparel__cta" href="#scene-07" block="mobile">
              Start an apparel project
            </ArrowLink>
          </div>

          <div className="wc-apparel__main">
            <ApparelMixer />

            <GlassCard
              as="section"
              tone="signal"
              emphasis="accent"
              className="wc-apparel-kit"
              aria-labelledby="scene-04-kit"
              data-apparel-reveal
            >
              <header className="wc-apparel-kit__header">
                <IconBadge tone="signal" size="sm">
                  <Package size={18} />
                </IconBadge>
                <h3 id="scene-04-kit" className="wc-apparel-kit__title">
                  Every design ships as a full kit
                </h3>
                <p className="wc-apparel-kit__note">
                  Front + back · ready to print and launch
                </p>
              </header>
              <ul className="wc-apparel-kit__grid">
                {APPAREL_KIT.map(({ id, title, icon, formats }) => {
                  const KitIcon = KIT_ICONS[icon];
                  return (
                    <li
                      key={id}
                      className="wc-apparel-kit__item"
                      data-apparel-kit-item
                    >
                      <KitIcon
                        className="wc-apparel-kit__item-icon"
                        size={20}
                        aria-hidden="true"
                      />
                      <div>
                        <strong>{title}</strong>
                        <ul
                          className="wc-apparel-kit__formats"
                          aria-label={`${title} formats`}
                        >
                          {formats.map((format) => (
                            <Chip as="li" variant="tag" key={format}>
                              {format}
                            </Chip>
                          ))}
                        </ul>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </GlassCard>
          </div>
        </div>
      </ApparelSceneMotion>
    </SceneShell>
  );
}
