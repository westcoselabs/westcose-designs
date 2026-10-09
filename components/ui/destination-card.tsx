import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes } from "react";

import { ButtonLink, type ButtonLinkProps } from "@/components/ui/button";
import { GlassCard, type GlassCardTone } from "@/components/ui/glass-panel";

export type DestinationCardAccent = {
  primary: string;
  soft: string;
};

export type DestinationCardProps = HTMLAttributes<HTMLElement> & {
  title: string;
  description: string;
  href: ButtonLinkProps["href"];
  actionLabel: string;
  actionSymbol?: string;
  tone?: GlassCardTone;
  /** Tints the title and CTA glass; omit to keep the tone's default. */
  accent?: DestinationCardAccent;
  /** An optional preview action, separate from the destination link. */
  previewAction?: ButtonHTMLAttributes<HTMLButtonElement>;
};

/** Compact destination link: copy on the left, CTA on the right, optional detail preview. */
export function DestinationCard({
  title,
  description,
  href,
  actionLabel,
  actionSymbol = "→",
  tone = "warm",
  accent,
  previewAction,
  className,
  style,
  ...props
}: DestinationCardProps) {
  const accentStyle = accent
    ? ({
        "--wc-card-accent": accent.primary,
        "--wc-card-accent-soft": accent.soft,
      } as CSSProperties)
    : undefined;

  return (
    <GlassCard
      {...props}
      as="li"
      tone={tone}
      className={["wc-destination-card", className].filter(Boolean).join(" ")}
      style={{ ...accentStyle, ...style }}
      data-accent={accent ? "tinted" : undefined}
    >
      <h3 className="wc-destination-card__title">
        {previewAction ? (
          <button {...previewAction} type="button" className="wc-destination-card__preview">
            {title}
          </button>
        ) : title}
      </h3>
      <p className="wc-destination-card__description">{description}</p>
      <ButtonLink
        href={href}
        variant="glass"
        size="sm"
        className="wc-destination-card__action"
      >
        {actionLabel}<span aria-hidden="true">{actionSymbol}</span>
      </ButtonLink>
    </GlassCard>
  );
}
