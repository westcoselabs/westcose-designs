import type { HTMLAttributes } from "react";

export type IconBadgeTone = "coastal" | "signal" | "signal-soft";

type IconBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: IconBadgeTone;
  size?: "md" | "sm";
};

/** Outlined circle holding a glyph. Decorative by default. */
export function IconBadge({
  tone = "coastal",
  size = "md",
  className,
  ...props
}: IconBadgeProps) {
  return (
    <span
      aria-hidden="true"
      {...props}
      className={["wc-icon-badge", className].filter(Boolean).join(" ")}
      data-tone={tone}
      data-size={size}
    />
  );
}
