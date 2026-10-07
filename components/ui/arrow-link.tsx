import Link from "next/link";
import type { ComponentProps } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

export type ArrowLinkProps = ComponentProps<typeof Link> & {
  /** "mobile" turns the link into a full-width pill on phones. */
  block?: "mobile";
};

/** The primary in-scene call to action: label, rule, arrow. */
export function ArrowLink({ className, children, block, ...props }: ArrowLinkProps) {
  return (
    <Link
      {...props}
      className={["wc-arrow-link", className].filter(Boolean).join(" ")}
      data-block={block}
    >
      {children}
      <span className="wc-arrow-link__rule" aria-hidden="true" />
      <ArrowRight size={22} aria-hidden="true" />
    </Link>
  );
}
