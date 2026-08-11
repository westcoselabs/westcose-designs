import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  ComponentProps,
  ReactNode,
} from "react";

export type ButtonVariant = "solid" | "outline" | "glass" | "quiet";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonStyleProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonStyleProps;

export type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "className"> &
  ButtonStyleProps & {
    children: ReactNode;
  };

export function Button({
  variant = "solid",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={["wc-button", className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-size={size}
    />
  );
}

export function ButtonLink({
  variant = "solid",
  size = "md",
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      {...props}
      className={["wc-button", className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-size={size}
    />
  );
}
