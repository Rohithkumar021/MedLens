import * as React from "react";
import { cn } from "../../lib/utils";

function Avatar({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-100 items-center justify-center font-bold text-slate-700 text-xs border border-slate-200 select-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function AvatarFallback({ className, children, ...props }) {
  return (
    <span
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-brand-50 text-brand-700 font-extrabold text-xs",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { Avatar, AvatarFallback };
