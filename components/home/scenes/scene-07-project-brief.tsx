import { SceneShell } from "@/components/home/scene-shell";
import { ProjectBriefForm } from "@/components/forms/project-brief-form";
import { Container } from "@/components/layout/container";

export function Scene07ProjectBrief() {
  return (
    <SceneShell
      sceneId="scene-07"
      className="wc-scene-project-brief"
      labelledBy="scene-07-title"
    >
      <Container className="wc-scene-project-brief__layout" width="wide">
        <div className="wc-scene-project-brief__lead">
          <p className="wc-home-scene__label">Scene 07 / Project Brief</p>
          <h2 id="scene-07-title" className="wc-display-lg">
            The next thing doesn&apos;t exist yet.
          </h2>
          <p className="wc-body-lg wc-scene-project-brief__intro">
            Tell us what you are building, what needs to change, and why it
            matters. We will start with the right questions.
          </p>
        </div>

        <aside className="wc-scene-project-brief__index" aria-label="Design disciplines">
          <p>Brief 07 / 07</p>
          <ul className="wc-scene-project-brief__disciplines">
            <li>Identity</li>
            <li>Illustration</li>
            <li>Apparel</li>
            <li>Visual systems</li>
          </ul>
        </aside>

        <ProjectBriefForm />
      </Container>
    </SceneShell>
  );
}
