import type { ElementType, HTMLAttributes } from "react";

type ChipProps = HTMLAttributes<HTMLElement> & {
  as?: "span" | "p" | "li";
  tone?: "neutral" | "signal";
  /** "tag" is the compact square-cornered format label. */
  variant?: "pill" | "tag";
};

export function Chip({
  as = "span",
  tone = "neutral",
  variant = "pill",
  className,
  ...props
}: ChipProps) {
  const Element: ElementType = as;
  return (
    <Element
      {...props}
      className={["wc-chip", className].filter(Boolean).join(" ")}
      data-tone={tone}
      data-variant={variant}
    />
  );
}
