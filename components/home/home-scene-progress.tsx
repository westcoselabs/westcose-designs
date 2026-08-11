import { HOME_SCENES, type HomeSceneState } from "@/lib/home/scene-registry";

type HomeSceneProgressProps = {
  state: HomeSceneState;
};

const NAVIGABLE_HOME_SCENES = HOME_SCENES.filter(
  (scene) => scene.id !== "scene-00",
);

export function HomeSceneProgress({ state }: HomeSceneProgressProps) {
  const activeScene =
    HOME_SCENES.find((scene) => scene.id === state.sceneId) ?? HOME_SCENES[0];
  const percentage = Math.round(state.progress * 100);

  return (
    <>
      <nav className="wc-home-progress" aria-label="Homepage scenes">
        <div className="wc-home-progress__current" aria-hidden="true">
          <span>{activeScene.number}</span>
          <span>{activeScene.shortLabel}</span>
        </div>

        <ol className="wc-home-progress__list">
          {NAVIGABLE_HOME_SCENES.map((scene) => (
            <li key={scene.id}>
              <a
                href={`#${scene.id}`}
                aria-label={`Scene ${scene.number}: ${scene.label}`}
                aria-current={scene.id === state.sceneId ? "step" : undefined}
              >
                <span aria-hidden="true" />
              </a>
            </li>
          ))}
        </ol>

        <div
          className="wc-home-progress__bar"
          role="progressbar"
          aria-label="Current scene progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
        >
          <span />
        </div>
      </nav>

      <p className="wc-sr-only">
        Scene {activeScene.number}: {activeScene.label}
      </p>
    </>
  );
}
