import { HomeSceneController } from "@/components/home/home-scene-controller";
import { HomeLiquidBackdrop } from "@/components/home/motion/home-liquid-backdrop";
import { Scene00Loader } from "@/components/home/scenes/scene-00-loader";
import { Scene015IllustrationRail } from "@/components/home/scenes/scene-015-illustration-rail";
import { Scene01LiquidHero } from "@/components/home/scenes/scene-01-liquid-hero";
import { Scene02FallingStudio } from "@/components/home/scenes/scene-02-falling-studio";
import { Scene03Greenfield } from "@/components/home/scenes/scene-03-greenfield";
import { Scene04Sketchbook } from "@/components/home/scenes/scene-04-sketchbook";
import { Scene05Corporate } from "@/components/home/scenes/scene-05-corporate";
import { Scene06Orbit } from "@/components/home/scenes/scene-06-orbit";
import { Scene07ProjectBrief } from "@/components/home/scenes/scene-07-project-brief";

export function HomeExperience() {
  return (
    <HomeSceneController>
      <HomeLiquidBackdrop />
      <Scene00Loader />
      <Scene01LiquidHero />
      <Scene015IllustrationRail />
      <Scene02FallingStudio />
      <Scene03Greenfield />
      <Scene04Sketchbook />
      <Scene05Corporate />
      <Scene06Orbit />
      <Scene07ProjectBrief />
    </HomeSceneController>
  );
}
