import { SceneShell } from "@/components/home/scene-shell";
import { LiquidHeroReveal } from "@/components/home/motion/liquid-hero-reveal";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";

export function Scene01LiquidHero() {
  return (
    <SceneShell
      sceneId="scene-01"
      className="wc-scene-liquid"
      labelledBy="scene-01-title"
    >
      <LiquidHeroReveal>
        <div className="wc-scene-liquid__field" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <Container className="wc-scene-liquid__content" width="wide">
          <p className="wc-home-scene__label" data-hero-reveal>
            Scene 01 / Liquid
          </p>
          <h1
            id="scene-01-title"
            className="wc-scene-liquid__title"
            tabIndex={-1}
          >
            <span className="wc-scene-liquid__line">
              <span data-hero-reveal>We don&apos;t make logos.</span>
            </span>
            <span className="wc-scene-liquid__line" data-accent>
              <span data-hero-reveal>We build things people remember.</span>
            </span>
          </h1>

          <div className="wc-scene-liquid__footer" data-hero-reveal>
            <p className="wc-body-lg">
              Independent multidisciplinary design studio creating identities,
              illustration, apparel graphics, and visual systems.
            </p>
            <ButtonLink href="/work" variant="glass">
              View selected work
            </ButtonLink>
          </div>
        </Container>
      </LiquidHeroReveal>
    </SceneShell>
  );
}
