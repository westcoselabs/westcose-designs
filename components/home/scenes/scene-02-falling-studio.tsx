import Image from "next/image";

import { FallingVideoScrub } from "@/components/home/motion/falling-video-scrub";
import { SceneShell } from "@/components/home/scene-shell";
import { Container } from "@/components/layout/container";
import {
  FALLING_STUDIO_ARTWORK,
  FALLING_STUDIO_CATEGORIES,
  FALLING_STUDIO_MEDIA,
  FALLING_STUDIO_STATIC_ARTWORK,
} from "@/lib/home/falling-studio-manifest";

export function Scene02FallingStudio() {
  return (
    <SceneShell
      sceneId="scene-02"
      className="wc-scene-falling wc-scene-falling--refined"
      labelledBy="scene-02-title"
    >
      <FallingVideoScrub
        videoSrc={FALLING_STUDIO_MEDIA.video}
        posterSrc={FALLING_STUDIO_MEDIA.poster}
        stills={FALLING_STUDIO_MEDIA.stills}
      >
        <div className="wc-scene-falling__shaft" aria-hidden="true">
          <span
            className="wc-refined-falling__entry-portal"
            data-falling-entry-receiver
          >
            <i />
          </span>
          <span className="wc-scene-falling__depth-line" />
        </div>

        <div className="wc-refined-falling__artwork-field" aria-hidden="true">
          {FALLING_STUDIO_ARTWORK.map((artwork) => (
            <figure
              key={artwork.id}
              className="wc-refined-falling__artwork"
              data-falling-artwork={artwork.id}
              data-falling-category={artwork.category}
              data-depth={artwork.depth}
            >
              <div className="wc-refined-falling__artwork-media">
                <Image
                  src={artwork.src}
                  width={artwork.width}
                  height={artwork.height}
                  sizes={
                    artwork.depth === "foreground"
                      ? "(max-width: 1023px) 46vw, 32vw"
                      : "(max-width: 1023px) 34vw, 24vw"
                  }
                  alt=""
                />
              </div>
              <figcaption>{artwork.title}</figcaption>
            </figure>
          ))}
        </div>

        <Container className="wc-scene-falling__content" width="wide">
          <div className="wc-scene-falling__copy">
            <p className="wc-home-scene__label">Scene 02 / Falling Studio</p>
            <h2 id="scene-02-title" className="wc-heading-1">
              Enter the studio.
            </h2>
            <p className="wc-body">
              Real work moves through the frame as identity, illustration,
              apparel, and complete brand systems take shape.
            </p>
          </div>

          <ol
            className="wc-scene-falling__legend"
            aria-label="Falling Studio categories"
          >
            {FALLING_STUDIO_CATEGORIES.map((category) => (
              <li key={category.id} data-category={category.id}>
                {category.label}
              </li>
            ))}
          </ol>
        </Container>

        <ol
          className="wc-refined-falling__static-story"
          aria-label="Selected WestCose work"
        >
          {FALLING_STUDIO_STATIC_ARTWORK.map((artwork, index) => (
            <li key={artwork.id}>
              <figure>
                <div className="wc-refined-falling__static-media">
                  <Image
                    src={artwork.src}
                    width={artwork.width}
                    height={artwork.height}
                    sizes="(max-width: 767px) 88vw, 42vw"
                    alt={artwork.alt}
                    loading="lazy"
                  />
                </div>
                <figcaption>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{artwork.title}</strong>
                  <small>
                    {
                      FALLING_STUDIO_CATEGORIES.find(
                        (category) => category.id === artwork.category,
                      )?.label
                    }
                  </small>
                </figcaption>
              </figure>
            </li>
          ))}
        </ol>
      </FallingVideoScrub>
    </SceneShell>
  );
}
