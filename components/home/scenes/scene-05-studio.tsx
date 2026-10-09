import Image from "next/image";
import type { HTMLAttributes } from "react";

import { StudioSceneMotion } from "@/components/home/motion/studio-scene-motion";
import { SceneShell } from "@/components/home/scene-shell";
import { DisplayHeading, Eyebrow, Lede, MetaLabel } from "@/components/ui/typography";

type StudioPartProps = HTMLAttributes<HTMLDivElement>;

function joinClassNames(...classNames: (string | undefined)[]) {
  return classNames.filter(Boolean).join(" ");
}

/** The Designs still. Scene 06 renders a twin so the pullback crosses scenes. */
export function StudioArt({ className, ...props }: StudioPartProps) {
  return (
    <div {...props} className={joinClassNames("wc-studio__art", className)} aria-hidden="true">
      <Image
        src="/experience/orbit/stills/designs.webp"
        alt=""
        width={1254}
        height={1254}
        sizes="(max-width: 767px) 120vw, 100vw"
      />
    </div>
  );
}

/** The studio's closing line, shared with Scene 06's opening frame. */
export function StudioTransitionCopy({ className, ...props }: StudioPartProps) {
  return (
    <div {...props} className={joinClassNames("wc-studio__transition-placement", className)}>
      <div className="wc-studio__transition" data-studio-transition>
        <Eyebrow mark={null}>One studio. A wider world.</Eyebrow>
        <DisplayHeading as="h3" lines={["There’s more", "to WestCose."]} />
        <Lede>Choose your destination.</Lede>
      </div>
    </div>
  );
}

export function Scene05Studio() {
  return (
    <SceneShell sceneId="scene-05" className="wc-scene-studio" labelledBy="scene-05-title">
      <StudioSceneMotion>
        <StudioArt />
        <div className="wc-studio__copy" data-studio-copy>
          <Eyebrow mark={null}>The studio / Independent by design</Eyebrow>
          <DisplayHeading id="scene-05-title" lines={["Built", "here."]} />
          <Lede>
            Independent design with a point of view. From identities and
            illustrations to the graphics you wear, every project starts with
            an idea worth making.
          </Lede>
          <div className="wc-studio__principles">
            <MetaLabel>Original thinking.</MetaLabel>
            <MetaLabel>Considered details.</MetaLabel>
          </div>
        </div>
        <StudioTransitionCopy />
        <MetaLabel className="wc-studio__caption">A closer look at what makes WestCose.</MetaLabel>
      </StudioSceneMotion>
    </SceneShell>
  );
}
