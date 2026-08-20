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
        <div className="wc-scene-liquid__field" aria-hidden="true" />

        <Container className="wc-scene-liquid__content" width="wide">
          <p className="wc-home-scene__label" data-hero-reveal>
            Scene 01 / Kinetic Field
          </p>
          <h1
            id="scene-01-title"
            className="wc-scene-liquid__title"
            tabIndex={-1}
          >
            <span className="wc-scene-liquid__line" data-tone="ghost">
              <span data-hero-reveal>We don&apos;t</span>
            </span>
            <span className="wc-scene-liquid__line" data-tone="ghost">
              <span data-hero-reveal>Make logos.</span>
            </span>
            <span className="wc-scene-liquid__line" data-tone="solid">
              <span data-hero-reveal>We build things</span>
            </span>
            <span className="wc-scene-liquid__line" data-tone="accent">
              <span data-hero-reveal>People remember.</span>
            </span>
          </h1>

          <div className="wc-scene-liquid__footer" data-hero-reveal>
            <p className="wc-body-lg">
              Independent multidisciplinary design studio creating identities,
              illustration, apparel graphics, and visual systems.
            </p>
            <ButtonLink
              href="/work"
              variant="solid"
              className="wc-scene-liquid__cta"
            >
              View selected work
            </ButtonLink>
          </div>
        </Container>
      </LiquidHeroReveal>
    </SceneShell>
  );
}
