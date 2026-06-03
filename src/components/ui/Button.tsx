import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-surface-base hover:bg-primary-400 focus:ring-primary/40 font-semibold",
  secondary:
    "bg-transparent text-zinc-300 hover:text-zinc-100 hover:bg-surface-container-high border border-surface-outline-variant",
  danger:
    "bg-red-600 text-white hover:bg-red-500 focus:ring-red-500/40 font-semibold",
  ghost:
    "text-zinc-400 hover:text-zinc-100 hover:bg-surface-container-high",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg min-h-[32px]",
  md: "px-4 py-2 text-sm rounded-lg min-h-[40px]",
  lg: "px-6 py-3 text-base rounded-lg min-h-[48px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`btn ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        aria-disabled={disabled}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
