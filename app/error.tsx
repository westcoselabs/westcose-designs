"use client";

import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main id="main-content" className="wc-state-page">
      <section className="wc-state-panel" aria-labelledby="error-title">
        <p className="wc-eyebrow">System notice / 500</p>
        <h1 id="error-title" className="wc-heading-1">
          Something went wrong
        </h1>
        <p className="wc-body-lg">
          Please try loading this part of the site again.
        </p>
        <Button type="button" onClick={reset} variant="solid">
          Try again
        </Button>
      </section>
    </main>
  );
}
