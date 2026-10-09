import type { ElementType, HTMLAttributes, ReactNode } from "react";

export type GlassPanelProps = Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> & {
  as?: "div" | "aside" | "section";
  children: ReactNode;
};

export function GlassPanel({
  as = "div",
  className,
  children,
  ...props
}: GlassPanelProps) {
  const Element: ElementType = as;

  return (
    <Element
      {...props}
      className={["wc-glass", className].filter(Boolean).join(" ")}
      data-material="glass"
    >
      {children}
    </Element>
  );
}

export type GlassCardTone = "coastal" | "signal" | "signal-soft" | "neutral" | "warm";

export type GlassCardProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  as?: "div" | "section" | "article" | "li" | "header";
  tone?: GlassCardTone;
  /** "accent" tints the border with the tone color. */
  emphasis?: "accent";
  shape?: "card" | "pill";
  children: ReactNode;
};

/** Tinted dark glass from the coastal hero: service cards, kit panels, control pills. */
export function GlassCard({
  as = "div",
  tone = "coastal",
  emphasis,
  shape = "card",
  className,
  children,
  ...props
}: GlassCardProps) {
  const Element: ElementType = as;

  return (
    <Element
      {...props}
      className={["wc-glass-card", className].filter(Boolean).join(" ")}
      data-tone={tone}
      data-emphasis={emphasis}
      data-shape={shape}
    >
      {children}
    </Element>
  );
}
