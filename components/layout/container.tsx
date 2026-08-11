import type { ElementType, HTMLAttributes, ReactNode } from "react";

type ContainerProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  as?: "div" | "section" | "main";
  width?: "wide" | "content" | "prose";
  children: ReactNode;
};

type EditorialGridProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  as?: "div" | "section";
  children: ReactNode;
};

export function Container({
  as = "div",
  width = "wide",
  className,
  children,
  ...props
}: ContainerProps) {
  const Element: ElementType = as;

  return (
    <Element
      {...props}
      className={["wc-container", className].filter(Boolean).join(" ")}
      data-width={width}
    >
      {children}
    </Element>
  );
}

export function EditorialGrid({
  as = "div",
  className,
  children,
  ...props
}: EditorialGridProps) {
  const Element: ElementType = as;

  return (
    <Element
      {...props}
      className={["wc-editorial-grid", className].filter(Boolean).join(" ")}
    >
      {children}
    </Element>
  );
}
