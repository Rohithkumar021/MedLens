import * as React from "react";
import { cn } from "../../lib/utils";

const alertVariants = ({
  variant = "default",
  className = ""
} = {}) => {
  const base = "relative w-full rounded-xl border p-4 text-xs [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4";

  const variants = {
    default: "bg-white text-slate-900 border-slate-200",
    info: "bg-sky-50 border-sky-200 text-sky-900 [&>svg]:text-brand-600",
    warning: "bg-amber-50 border-amber-200 text-amber-900 [&>svg]:text-amber-700",
    destructive: "bg-rose-50 border-rose-200 text-rose-900 [&>svg]:text-rose-600",
    success: "bg-emerald-50 border-emerald-200 text-emerald-900 [&>svg]:text-emerald-600",
  };

  return cn(base, variants[variant] || variants.default, className);
};

const Alert = React.forwardRef(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={alertVariants({ variant, className })}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-bold leading-none tracking-tight text-slate-900", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs leading-relaxed text-slate-600 [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };

