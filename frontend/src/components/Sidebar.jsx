import React from 'react';
import { LayoutDashboard, Users, FileText, Clock, AlertTriangle, CheckSquare, Settings, ShieldCheck } from 'lucide-react';

export default function Sidebar({
  currentTab,
  setTab,
  conflictsCount = 0,
  unreviewedCount = 0,
  isMobileOpen = false,
  onCloseMobile = () => {}
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients Workspace', icon: Users },
    { id: 'reports', label: 'Medical Reports (Side-by-Side)', icon: FileText },
    { id: 'timeline', label: 'Patient Timeline', icon: Clock },
    { id: 'conflicts', label: 'Clinical Inconsistencies', icon: AlertTriangle, badge: conflictsCount, badgeColor: 'bg-rose-600' },
    { id: 'review', label: 'Human Review & Audit', icon: CheckSquare, badge: unreviewedCount, badgeColor: 'bg-amber-600' },
    { id: 'settings', label: 'System & Principles', icon: Settings },
  ];

  const handleNavClick = (id) => {
    setTab(id);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col justify-between h-full p-4">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
          Clinical Intelligence Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                isActive
                  ? 'bg-sky-50 text-brand-700 font-bold border border-sky-200/90 shadow-subtle'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} aria-hidden="true" />
                <span>{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className={`text-[10px] text-white px-1.5 py-0.5 rounded-full font-bold ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Safety & Compliance Box */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] space-y-1.5 text-slate-600 select-none">
        <div className="font-bold text-slate-800 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
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
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl z-10 animate-modal-in">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
