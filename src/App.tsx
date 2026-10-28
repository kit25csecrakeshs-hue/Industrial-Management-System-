import React, { useState } from 'react';
import { IndustrialProvider, useIndustrial } from './context/IndustrialContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastContainer } from './components/ToastContainer';
import { DashboardView } from './views/DashboardView';
import { EmployeesView } from './views/EmployeesView';
import { InventoryView } from './views/InventoryView';
import { ProductionView } from './views/ProductionView';
import { SuppliersView } from './views/SuppliersView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

const MainLayout: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { activeTab, settings } = useIndustrial();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'employees':
        return <EmployeesView />;
      case 'inventory':
        return <InventoryView />;
      case 'production':
        return <ProductionView />;
      case 'suppliers':
        return <SuppliersView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileNavOpen} setMobileOpen={setMobileNavOpen} />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 transition-all">
        {/* Top Header */}
        <Header onToggleMobile={() => setMobileNavOpen(!mobileNavOpen)} />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>

        {/* Footer */}
        <footer className="no-print bg-white border-t border-slate-200 px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">{settings.plantName}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-400">{settings.plantCode}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>College Software Project</span>
            <span aria-hidden="true">·</span>
            <span>HTML5 localStorage Persisted</span>
          </div>
        </footer>
      </div>

      {/* Global Toast Notifier */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <IndustrialProvider>
      <MainLayout />
    </IndustrialProvider>
  );
}
