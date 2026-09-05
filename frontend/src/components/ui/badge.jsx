import * as React from "react";
import { cn } from "../../lib/utils";

const badgeVariants = ({
  variant = "default",
  className = ""
} = {}) => {
  const base = "inline-flex items-center rounded-md border px-2 py-0.5 text-[10.5px] font-bold tracking-wide transition-colors select-none";

  const variants = {
    default: "border-transparent bg-brand-600 text-white shadow-xs",
    secondary: "border-slate-200 bg-slate-100 text-slate-800",
    outline: "border-slate-300 text-slate-700 bg-white",
    destructive: "border-rose-200 bg-rose-50 text-rose-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    clinical: "border-sky-200 bg-sky-50 text-brand-700 font-mono",
    muted: "border-slate-200 bg-slate-50 text-slate-600 font-mono",
  };

  return cn(base, variants[variant] || variants.default, className);
};

function Badge({ className, variant = "default", ...props }) {
  return (
    <div className={badgeVariants({ variant, className })} {...props} />
  );
}

export { Badge, badgeVariants };

