import type { CSSProperties, ReactNode } from "react";

import { getHomeScene, type HomeSceneId } from "@/lib/home/scene-registry";

type SceneShellProps = {
  sceneId: HomeSceneId;
  labelledBy?: string;
  ariaLabel?: string;
  className?: string;
  children: ReactNode;
};

type SceneStyle = CSSProperties & {
  "--wc-home-scene-height": string;
};

export function SceneShell({
  sceneId,
  labelledBy,
  ariaLabel,
  className,
  children,
}: SceneShellProps) {
  const scene = getHomeScene(sceneId);
  const style: SceneStyle = {
    "--wc-home-scene-height": scene.scrollHeight,
  };

  return (
    <section
      id={scene.id}
      className={["wc-home-scene", className].filter(Boolean).join(" ")}
      style={style}
      data-home-scene-id={scene.id}
      data-scene-number={scene.number}
      data-scene-layout={scene.layout}
      data-theme={scene.environmentTheme}
      aria-labelledby={labelledBy}
      aria-label={ariaLabel}
    >
      <div className="wc-home-scene__stage">{children}</div>
    </section>
  );
}
