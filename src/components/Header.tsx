import React from 'react';
import { useIndustrial } from '../context/IndustrialContext';
import { Menu, Clock, RefreshCw, BookOpen, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  onToggleMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobile }) => {
  const { activeTab, setActiveTab, settings, stats, resetToSampleData } = useIndustrial();

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Operations Dashboard',
      subtitle: 'Real-time overview of workforce, inventory levels, and production lines',
    },
    employees: {
      title: 'Employee Management',
      subtitle: 'Manage industrial personnel, departmental rosters, shifts, and credentials',
    },
    inventory: {
      title: 'Inventory & Materials',
      subtitle: 'Track raw materials, spare parts, stock levels, and automated reorder alerts',
    },
    production: {
      title: 'Production Batches',
      subtitle: 'Monitor manufacturing lines, scheduled batches, and unit completion progress',
    },
    suppliers: {
      title: 'Supplier & Vendor Directory',
      subtitle: 'Manage raw material suppliers, contact information, and delivery reliability',
    },
    reports: {
      title: 'Reports & Plant Audits',
      subtitle: 'Generate printable industrial summaries and download CSV spreadsheets',
    },
    settings: {
      title: 'Plant Settings & Viva Guide',
      subtitle: 'Manage local data backups and view the college project viva defense guide',
    },
  };

  const currentInfo = tabTitles[activeTab] || tabTitles.dashboard;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 no-print">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Plant Operations</span>
            <span aria-hidden="true">/</span>
            <span className="text-blue-600 font-semibold capitalize">{activeTab}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight">
            {currentInfo.title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Low Stock Warning Pill */}
        {stats.lowStockCount > 0 && activeTab !== 'inventory' && (
          <button
            onClick={() => setActiveTab('inventory')}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>{stats.lowStockCount} Low Stock</span>
          </button>
        )}

        {/* Current Shift Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-lg">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>General Shift (08:00 - 17:00)</span>
        </div>

        {/* Viva Guide Shortcut */}
        <button
          onClick={() => setActiveTab('settings')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
          title="Open College Project Guide & Viva Questions"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Project Guide</span>
        </button>

        {/* Reset Demo Data Button */}
        <button
          onClick={resetToSampleData}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          title="Reset to Factory Sample Data"
          aria-label="Reset to Sample Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
