import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CircleNotch,
  PenNib,
  SquaresFour,
  TShirt,
} from "@phosphor-icons/react/dist/ssr";

import { SceneShell } from "@/components/home/scene-shell";
import { ArrowLink } from "@/components/ui/arrow-link";
import { IconBadge } from "@/components/ui/icon-badge";
import { DisplayHeading, Eyebrow, Lede } from "@/components/ui/typography";
import { LiquidHeroReveal } from "@/components/home/motion/liquid-hero-reveal";
import heroArtwork from "@/portfolio/hero4.png";

const heroServices = [
  {
    title: "Brand Identity",
    description: "Logos, marks, and branding systems that leave a mark.",
    href: "#scene-03",
    icon: CircleNotch,
    tone: "coastal",
  },
  {
    title: "Illustration",
    description: "Bold, detailed artwork with attitude and edge.",
    href: "#scene-01-5",
    icon: PenNib,
    tone: "signal-soft",
  },
  {
    title: "Apparel Design",
    description: "Streetwear graphics built to stand out.",
    href: "#scene-04",
    icon: TShirt,
    tone: "coastal",
  },
  {
    title: "Visual Systems",
    description: "Design systems and guidelines that scale with purpose.",
    href: "#scene-05",
    icon: SquaresFour,
    tone: "signal-soft",
  },
] as const;

export function Scene01LiquidHero() {
  return (
    <SceneShell
      sceneId="scene-01"
      className="wc-scene-liquid wc-coastal-hero"
      labelledBy="scene-01-title"
    >
      <LiquidHeroReveal>
        <div className="wc-coastal-hero__atmosphere" aria-hidden="true" />
        <div className="wc-coastal-hero__art" data-hero-art>
          <Image
            src={heroArtwork}
            alt="WestCose coastal illustration with a tattooed woman, ocean waves, palms, and a vintage motel."
            fill
            sizes="(max-width: 767px) 180vw, 100vw"
            priority
          />
        </div>
        <div className="wc-coastal-hero__scrim" aria-hidden="true" />

        <div className="wc-scene-liquid__content wc-coastal-hero__content">
          <div className="wc-coastal-hero__copy">
            <Eyebrow className="wc-coastal-hero__eyebrow" data-hero-reveal>
              Coastal misfits. Creative engines.
            </Eyebrow>
            <DisplayHeading
              as="h1"
              size="hero"
              id="scene-01-title"
              className="wc-coastal-hero__title"
              tabIndex={-1}
              lines={["We build", "Things people", "Remember."]}
              lineProps={{ "data-hero-reveal": "" }}
            />
            <Lede className="wc-coastal-hero__description" data-hero-reveal>
              Branding, illustration, apparel, and visual systems, crafted in
              the WestCose style.
            </Lede>
            <ArrowLink
              className="wc-coastal-hero__cta"
              href="#scene-01-5"
              data-hero-reveal
            >
              View our work
            </ArrowLink>
          </div>

          <nav
            id="hero-services"
            className="wc-coastal-hero__services"
            aria-label="Explore our services"
          >
            {heroServices.map(
              ({ title, description, href, icon: Icon, tone }, index) => (
                <Link
                  className="wc-glass-card wc-hero-service"
                  href={href}
                  data-tone={tone}
                  data-hero-reveal
                  key={title}
                >
                  <IconBadge className="wc-hero-service__icon" tone={tone}>
                    <Icon size={26} weight="regular" />
                  </IconBadge>
                  <div className="wc-hero-service__copy">
                    <h2>{title}</h2>
                    <p>{description}</p>
                  </div>
                  <span className="wc-hero-service__index" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <ArrowRight
                    className="wc-hero-service__arrow"
                    size={21}
                    aria-hidden="true"
                  />
                </Link>
              ),
            )}
          </nav>
        </div>
      </LiquidHeroReveal>
    </SceneShell>
  );
}
