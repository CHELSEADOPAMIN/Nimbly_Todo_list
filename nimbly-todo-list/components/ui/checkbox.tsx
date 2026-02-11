"use client";

import { Check } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface CheckboxProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "type"> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = ({
  checked,
  onCheckedChange,
  className,
  disabled,
  ...rest
}: CheckboxProps) => {
  return (
    <button
      {...rest}
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          onCheckedChange?.(!checked);
        }
      }}
      className={cn(
        "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-200",
        "focus-visible:ring-2 focus-visible:ring-[rgb(93_112_82_/_0.32)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        checked
          ? "border-primary bg-primary text-primary-foreground"
          : "border-[rgb(222_216_207_/_0.92)] bg-white/50 text-transparent hover:border-[rgb(93_112_82_/_0.5)]",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
      )}
    >
      <Check size={14} strokeWidth={2.5} aria-hidden="true" />
    </button>
  );
};
