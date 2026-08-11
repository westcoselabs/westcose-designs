import Link from "next/link";
import type { ComponentProps } from "react";

export type TextLinkProps = ComponentProps<typeof Link>;

export function TextLink({ className, ...props }: TextLinkProps) {
  return (
    <Link
      {...props}
      className={["wc-text-link", className].filter(Boolean).join(" ")}
    />
  );
}
