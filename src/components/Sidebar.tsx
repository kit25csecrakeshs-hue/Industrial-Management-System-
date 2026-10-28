import React from 'react';
import { useIndustrial } from '../context/IndustrialContext';
import { NavigationTab } from '../types';
import {
  LayoutDashboard,
  Users,
  Boxes,
  Factory,
  Truck,
  FileBarChart2,
  Settings,
  ShieldCheck,
  X,
  Building2,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { activeTab, setActiveTab, stats, settings } = useIndustrial();

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: number | string; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: <Users className="w-5 h-5" />,
      badge: stats.totalEmployees,
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <Boxes className="w-5 h-5" />,
      badge: stats.lowStockCount > 0 ? `${stats.lowStockCount} Low` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'production',
      label: 'Production',
      icon: <Factory className="w-5 h-5" />,
      badge: stats.inProgressBatchesCount > 0 ? `${stats.inProgressBatchesCount} Active` : undefined,
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    },
    {
      id: 'suppliers',
      label: 'Suppliers',
      icon: <Truck className="w-5 h-5" />,
      badge: stats.totalSuppliers,
    },
    {
      id: 'reports',
      label: 'Reports & Export',
      icon: <FileBarChart2 className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: 'Settings & Viva Guide',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden no-print"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-950 text-slate-200 border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-base tracking-tight leading-none">
                Industrial MS
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">
                {settings.plantCode}
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Operations Modules
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
                      isActive
                        ? 'bg-blue-700/80 text-blue-100'
                        : item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Plant Status Indicator */}
        <div className="p-3.5 m-3 rounded-lg bg-slate-900 border border-slate-800/80">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/20" />
            <span className="text-[11px] font-semibold text-slate-300">Plant Systems Normal</span>
          </div>
          <p className="text-[10px] text-slate-400 line-clamp-1">
            {settings.plantName}
          </p>
          <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Storage: localStorage</span>
            <span className="flex items-center gap-1 text-slate-300">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Demo Ready
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
