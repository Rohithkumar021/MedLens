import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

const SheetContext = React.createContext({
  isOpen: false,
  onClose: () => {},
  side: "right",
});

function Sheet({ isOpen, onClose, side = "right", children }) {
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <SheetContext.Provider value={{ isOpen, onClose, side }}>
      <div className="fixed inset-0 z-50 flex">
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
        {children}
      </div>
    </SheetContext.Provider>
  );
}

function SheetContent({ className, children, side: propSide, ...props }) {
  const { onClose, side: contextSide } = React.useContext(SheetContext);
  const side = propSide || contextSide || "right";

  const sideClasses = {
    right: "inset-y-0 right-0 h-full w-full sm:max-w-md md:max-w-lg border-l border-slate-200 animate-in slide-in-from-right duration-200",
    left: "inset-y-0 left-0 h-full w-full sm:max-w-md md:max-w-lg border-r border-slate-200 animate-in slide-in-from-left duration-200",
    bottom: "inset-x-0 bottom-0 h-auto max-h-[85vh] border-t border-slate-200 rounded-t-2xl animate-in slide-in-from-bottom duration-200",
  };

  return (
    <div
      className={cn(
        "fixed z-50 flex flex-col bg-white p-6 shadow-2xl overflow-y-auto",
        sideClasses[side] || sideClasses.right,
        className
      )}
      {...props}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        aria-label="Close sheet"
      >
        <X className="w-5 h-5" />
      </button>
      {children}
    </div>
  );
}

function SheetHeader({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1 pb-4 border-b border-slate-100 pr-8 text-left",
        className
      )}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }) {
  return (
    <h3
      className={cn("text-base font-bold text-slate-900", className)}
      {...props}
    />
  );
}

function SheetDescription({ className, ...props }) {
  return (
    <p
      className={cn("text-xs text-slate-500", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 border-t border-slate-100",
        className
      )}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
};

