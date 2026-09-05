import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

function Dialog({ isOpen, onClose, title, description, children, className, maxWidth = "max-w-lg" }) {
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative z-50 w-full rounded-2xl bg-white shadow-modal border border-slate-200 overflow-hidden animate-modal-in transition-all",
          maxWidth,
          className
        )}
      >
        <div className="flex items-start justify-between p-5 sm:p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            {title && <h3 className="text-base font-extrabold text-slate-900">{title}</h3>}
            {description && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

export { Dialog };

