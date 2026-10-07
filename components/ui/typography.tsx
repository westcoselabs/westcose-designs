import type { ElementType, HTMLAttributes, ReactNode } from "react";

function cx(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

type EyebrowProps = HTMLAttributes<HTMLParagraphElement> & {
  mark?: ReactNode;
};

/** Mono kicker with the ✦ mark, used above display headings. */
export function Eyebrow({ mark = "✦", className, children, ...props }: EyebrowProps) {
  return (
    <p {...props} className={cx("wc-eyebrow", className)}>
      <span className="wc-eyebrow__mark" aria-hidden="true">
        {mark}
      </span>
      {children}
    </p>
  );
}

type DisplayHeadingProps = Omit<HTMLAttributes<HTMLHeadingElement>, "children"> & {
  as?: "h1" | "h2" | "h3";
  size?: "hero" | "section";
  /** Each entry renders on its own line; the last line takes the accent. */
  lines: readonly ReactNode[];
  /** Extra attributes for every line (e.g. reveal hooks). */
  lineProps?: HTMLAttributes<HTMLSpanElement> & Record<`data-${string}`, string>;
};

export function DisplayHeading({
  as = "h2",
  size = "section",
  lines,
  lineProps,
  className,
  ...props
}: DisplayHeadingProps) {
  const Element: ElementType = as;

  return (
    <Element {...props} className={cx("wc-display", className)} data-size={size}>
      {lines.map((line, index) => (
        <span
          key={index}
          {...lineProps}
          className={cx("wc-display__line", lineProps?.className)}
        >
          {line}
        </span>
      ))}
    </Element>
  );
}

export function Lede({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p {...props} className={cx("wc-lede", className)} />;
}

type MetaLabelProps = HTMLAttributes<HTMLElement> & {
  as?: "p" | "span" | "h3" | "h4";
};

/** Small mono label for groups and lists ("What we bring"). */
export function MetaLabel({ as = "p", className, ...props }: MetaLabelProps) {
  const Element: ElementType = as;
  return <Element {...props} className={cx("wc-meta-label", className)} />;
}
