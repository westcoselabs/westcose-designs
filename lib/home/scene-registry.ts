export type HomeNavTheme = "hidden" | "dark" | "light" | "glass";
export type HomeCursorMode =
  | "none"
  | "distort"
  | "view"
  | "look"
  | "explore"
  | "flip"
  | "enter"
  | "start";

export const HOME_SCENES = [
  {
    id: "scene-00",
    number: "00",
    label: "Logo Loader",
    shortLabel: "Opening",
    layout: "overlay",
    scrollHeight: "0px",
    environmentTheme: "dark",
    navTheme: "hidden",
    cursorMode: "none",
  },
  {
    id: "scene-01",
    number: "01",
    label: "Liquid Hero",
    shortLabel: "Liquid",
    layout: "pinned",
    scrollHeight: "220svh",
    environmentTheme: "dark",
    navTheme: "glass",
    cursorMode: "distort",
  },
  {
    id: "scene-01-5",
    number: "01.5",
    label: "Illustration Rail",
    shortLabel: "Illustration",
    layout: "pinned",
    scrollHeight: "440svh",
    environmentTheme: "dark",
    navTheme: "dark",
    cursorMode: "view",
  },
  {
    id: "scene-02",
    number: "02",
    label: "Falling Studio",
    shortLabel: "Falling",
    layout: "pinned",
    scrollHeight: "400svh",
    environmentTheme: "dark",
    navTheme: "glass",
    cursorMode: "look",
  },
  {
    id: "scene-03",
    number: "03",
    label: "Brand Development / Identity Systems",
    shortLabel: "Identity",
    layout: "pinned",
    scrollHeight: "480svh",
    environmentTheme: "dark",
    navTheme: "dark",
    cursorMode: "explore",
  },
  {
    id: "scene-04",
    number: "04",
    label: "Sketchbook World",
    shortLabel: "Sketchbook",
    layout: "pinned",
    scrollHeight: "400svh",
    environmentTheme: "dark",
    navTheme: "dark",
    cursorMode: "flip",
  },
  {
    id: "scene-05",
    number: "05",
    label: "Corporate Identity",
    shortLabel: "Corporate",
    layout: "pinned",
    scrollHeight: "360svh",
    environmentTheme: "light",
    navTheme: "light",
    cursorMode: "view",
  },
  {
    id: "scene-06",
    number: "06",
    label: "WestCose Ecosystem Orbit",
    shortLabel: "Orbit",
    layout: "pinned",
    scrollHeight: "340svh",
    environmentTheme: "dark",
    navTheme: "glass",
    cursorMode: "enter",
  },
  {
    id: "scene-07",
    number: "07",
    label: "Project Brief",
    shortLabel: "Project Brief",
    layout: "flow",
    scrollHeight: "100svh",
    environmentTheme: "light",
    navTheme: "light",
    cursorMode: "start",
  },
] as const;

export type HomeScene = (typeof HOME_SCENES)[number];
export type HomeSceneId = HomeScene["id"];

export type HomeSceneState = {
  sceneId: HomeSceneId;
  progress: number;
  navTheme: HomeNavTheme;
  cursorMode: HomeCursorMode;
};

export const INITIAL_HOME_SCENE = HOME_SCENES[0];

export function getHomeScene(sceneId: HomeSceneId): HomeScene {
  const scene = HOME_SCENES.find((item) => item.id === sceneId);

  if (!scene) {
    throw new Error(`Unknown homepage scene: ${sceneId}`);
  }

  return scene;
}

export function getHomeSceneState(scene: HomeScene): HomeSceneState {
  return {
    sceneId: scene.id,
    progress: 0,
    navTheme: scene.navTheme,
    cursorMode: scene.cursorMode,
  };
}
