import * as React from "react";
import { cn } from "../../lib/utils";

const buttonVariants = ({
  variant = "default",
  size = "default",
  className = ""
} = {}) => {
  const base = "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50 select-none";

  const variants = {
    default: "bg-brand-600 text-white shadow-subtle hover:bg-brand-700 active:scale-[0.98]",
    primary: "bg-brand-600 text-white shadow-subtle hover:bg-brand-700 active:scale-[0.98]",
    secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 active:scale-[0.98]",
    outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    destructive: "bg-rose-600 text-white hover:bg-rose-700 shadow-subtle active:scale-[0.98]",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-subtle active:scale-[0.98]",
    subtle: "bg-sky-50 text-brand-700 border border-sky-200 hover:bg-sky-100",
    link: "text-brand-600 underline-offset-4 hover:underline p-0 h-auto font-bold",
  };

  const sizes = {
    default: "h-9 px-3.5 py-2",
    sm: "h-7 px-2.5 py-1 text-[11px]",
    lg: "h-11 px-5 py-2.5 text-sm",
    icon: "h-8 w-8 p-1.5",
  };

  return cn(base, variants[variant] || variants.default, sizes[size] || sizes.default, className);
};

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

