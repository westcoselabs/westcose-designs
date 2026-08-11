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
