import * as React from "react";
import { cn } from "../../lib/utils";

const TabsContext = React.createContext({
  value: "",
  onValueChange: () => {},
});

function Tabs({ value, defaultValue, onValueChange, className, children, ...props }) {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue || "");

  const currentTab = value !== undefined ? value : activeTab;

  const handleTabChange = (val) => {
    if (value === undefined) {
      setActiveTab(val);
    }
    if (onValueChange) {
      onValueChange(val);
    }
  };

  return (
    <TabsContext.Provider value={{ value: currentTab, onValueChange: handleTabChange }}>
      <div className={cn("space-y-4", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-xl bg-slate-100 p-1 text-slate-500 border border-slate-200/80",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function TabsTrigger({ value, className, disabled, children, ...props }) {
  const { value: selectedValue, onValueChange } = React.useContext(TabsContext);
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      disabled={disabled}
      onClick={() => onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1 text-xs font-bold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50",
        isSelected
          ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-extrabold"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function TabsContent({ value, className, children, ...props }) {
  const { value: selectedValue } = React.useContext(TabsContext);
  if (selectedValue !== value) return null;

  return (
    <div
      tabIndex={0}
      className={cn(
        "ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 animate-modal-in",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
