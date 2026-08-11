import { ButtonLink } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <main id="main-content" className="wc-state-page">
      <section className="wc-state-panel" aria-labelledby="not-found-title">
        <p className="wc-eyebrow">System notice / 404</p>
        <h1 id="not-found-title" className="wc-heading-1">
          Page not found
        </h1>
        <p className="wc-body-lg">
          The page you requested does not exist.
        </p>
        <ButtonLink href="/" variant="outline">
          Return home
        </ButtonLink>
      </section>
    </main>
  );
}
