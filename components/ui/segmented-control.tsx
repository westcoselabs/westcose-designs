"use client";

import type { ReactNode } from "react";

type SegmentedControlProps<Value extends string> = {
  label: string;
  value: Value;
  options: readonly { value: Value; label: ReactNode }[];
  onChange: (value: Value) => void;
  className?: string;
  children?: ReactNode;
};

/** Mutually exclusive toggle buttons. Extra children render after the options. */
export function SegmentedControl<Value extends string>({
  label,
  value,
  options,
  onChange,
  className,
  children,
}: SegmentedControlProps<Value>) {
  return (
    <div
      className={["wc-segmented", className].filter(Boolean).join(" ")}
      role="group"
      aria-label={label}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="wc-segmented__option"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
      {children}
    </div>
  );
}
