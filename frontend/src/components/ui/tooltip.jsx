import * as React from "react";
import { cn } from "../../lib/utils";

const TooltipContext = React.createContext({
  isVisible: false,
  setIsVisible: () => {},
});

function TooltipProvider({ children }) {
  return <>{children}</>;
}

function Tooltip({ content, children, className, position = "top" }) {
  const [isVisible, setIsVisible] = React.useState(false);

  // If used with shadcn subcomponents
  if (!content) {
    return (
      <TooltipContext.Provider value={{ isVisible, setIsVisible }}>
        <div
          className="relative inline-flex items-center"
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
          onFocus={() => setIsVisible(true)}
          onBlur={() => setIsVisible(false)}
        >
          {children}
        </div>
      </TooltipContext.Provider>
    );
  }

  const posClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
  };

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && content && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white shadow-md animate-in fade-in zoom-in-95 duration-150 pointer-events-none border border-slate-700",
            posClasses[position] || posClasses.top,
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}

function TooltipTrigger({ asChild, children, className, ...props }) {
  return (
    <div className={cn("inline-flex items-center", className)} {...props}>
      {children}
    </div>
  );
}

function TooltipContent({ children, className, side = "top", ...props }) {
  const { isVisible } = React.useContext(TooltipContext);
  if (!isVisible) return null;

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
  };

  return (
    <div
      role="tooltip"
      className={cn(
        "absolute z-50 rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white shadow-md animate-in fade-in zoom-in-95 duration-150 pointer-events-none border border-slate-700 whitespace-normal",
        sideClasses[side] || sideClasses.top,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent };
