import React from 'react';
import { LayoutDashboard, Users, FileText, Clock, AlertTriangle, CheckSquare, Settings, ShieldCheck } from 'lucide-react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

export default function Sidebar({
  currentTab,
  setTab,
  conflictsCount = 0,
  unreviewedCount = 0,
  isMobileOpen = false,
  onCloseMobile = () => {}
}) {
  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Clinical Dashboard', icon: LayoutDashboard },
        { id: 'patients', label: 'Patients Workspace', icon: Users },
      ],
    },
    {
      title: 'CLINICAL INTELLIGENCE',
      items: [
        { id: 'reports', label: 'Source Reports & Facts', icon: FileText },
        { id: 'timeline', label: 'Temporal Timeline', icon: Clock },
      ],
    },
    {
      title: 'AUDIT & GOVERNANCE',
      items: [
        {
          id: 'conflicts',
          label: 'Safety Inconsistencies',
          icon: AlertTriangle,
          badge: conflictsCount,
          badgeVariant: 'destructive',
        },
        {
          id: 'review',
          label: 'Human Review Queue',
          icon: CheckSquare,
          badge: unreviewedCount,
          badgeVariant: 'warning',
        },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'settings', label: 'Diagnostics & Principles', icon: Settings },
      ],
    },
  ];

  const handleNavClick = (id) => {
    setTab(id);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col justify-between h-full p-4">
      <div className="space-y-4">
        {navSections.map((section, idx) => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-sky-50 text-sky-900 font-semibold border border-sky-200/90 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-sky-600' : 'text-slate-400'
                        }`}
                        aria-hidden="true"
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge > 0 && (
                      <Badge
                        variant={item.badgeVariant || 'default'}
                        className="text-[10px] px-1.5 py-0 h-4 min-w-4 flex items-center justify-center font-bold"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
            {idx < navSections.length - 1 && <Separator className="my-2" />}
          </div>
        ))}
      </div>

      {/* Safety & Compliance Box */}
      <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] space-y-1.5 text-slate-600 select-none mt-4 shadow-2xs">
        <div className="font-bold text-slate-800 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>Deterministic Guardrails</span>
        </div>
        <p className="text-slate-500 text-[10.5px] leading-relaxed">
          Reference ranges evaluate strictly via source report bounds without AI hallucination.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0 min-h-[calc(100vh-6.5rem)]">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white border-r border-slate-200 shadow-xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
