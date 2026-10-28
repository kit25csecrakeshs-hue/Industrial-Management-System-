import React, { useState } from 'react';
import { useIndustrial } from '../context/IndustrialContext';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  Settings,
  Database,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  HelpCircle,
  FileCode,
  ShieldAlert,
  Save,
  Building,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetToSampleData,
    clearAllData,
    exportBackupJson,
    importBackupJson,
    showToast,
  } = useIndustrial();

  // Settings form state
  const [formData, setFormData] = useState({ ...settings });
  const [activeTab, setActiveTab] = useState<'config' | 'storage' | 'viva'>('config');

  // Modals
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          const success = importBackupJson(content);
          if (success) {
            setIsImportModalOpen(false);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePasteImport = () => {
    if (!importJsonText.trim()) {
      showToast('Please paste valid JSON data', 'error');
      return;
    }
    const success = importBackupJson(importJsonText);
    if (success) {
      setIsImportModalOpen(false);
      setImportJsonText('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'config'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Plant Parameters</span>
        </button>

        <button
          onClick={() => setActiveTab('storage')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'storage'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Data Storage & Backups</span>
        </button>

        <button
          onClick={() => setActiveTab('viva')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'viva'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>College Viva & Project Guide</span>
        </button>
      </div>

      {/* ================= SECTION 1: PLANT CONFIG ================= */}
      {activeTab === 'config' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-3xl">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <Building className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">Industrial Plant Configuration</h3>
              <p className="text-xs text-slate-500">
                Customize facility identification, currency symbol, and automatic thresholds
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Plant / Facility Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.plantName}
                  onChange={(e) => setFormData({ ...formData, plantName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Facility Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.plantCode}
                  onChange={(e) => setFormData({ ...formData, plantCode: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Plant Physical Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Currency Symbol
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                >
                  <option value="₹">₹ (Indian Rupee - INR)</option>
                  <option value="$">$ (US Dollar - USD)</option>
                  <option value="€">€ (Euro - EUR)</option>
                  <option value="£">£ (British Pound - GBP)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Global Low-Stock Warning Threshold
                </label>
                <input
                  type="number"
                  min="5"
                  value={formData.defaultLowStockThreshold}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultLowStockThreshold: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Plant Superintendent / Manager Name
                </label>
                <input
                  type="text"
                  value={formData.managerName}
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Plant Safety / Emergency Contact Phone
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Plant Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= SECTION 2: DATA STORAGE & BACKUPS ================= */}
      {activeTab === 'storage' && (
        <div className="space-y-6 max-w-3xl">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <Database className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Browser Data Persistence (localStorage)
                </h3>
                <p className="text-xs text-slate-500">
                  Data is safely cached inside the browser storage. No external server dependency is required.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="p-4 rounded-lg bg-blue-50/60 border border-blue-100 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <strong>Local Persistence Active:</strong> All modifications to employees, inventory,
                  production runs, and suppliers persist across page refreshes and browser re-launches using
                  JSON-serialized HTML5 <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">localStorage</code>.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Export Backup */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-blue-600" />
                      <span>Download JSON Backup</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Exports the entire state (all 4 modules + audit activities + settings) into a single portable JSON file.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={exportBackupJson}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Backup File</span>
                  </button>
                </div>

                {/* Import Backup */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span>Restore from JSON File</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Import a previously exported JSON backup file to restore records instantly.
                    </p>
                  </div>
                  <label className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select Backup JSON File</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone: Reset and Clear */}
          <div className="bg-white rounded-xl border border-red-200 p-6 shadow-xs">
            <div className="flex items-center gap-2.5 pb-3 border-b border-red-100">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="font-bold text-red-950 text-base">Factory Maintenance Operations</h3>
                <p className="text-xs text-red-700">
                  Reset demo data or clear browser cache for viva presentation
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-amber-50 border border-amber-200">
                <div>
                  <div className="font-bold text-amber-900 text-xs">
                    Reset to Factory Sample Data
                  </div>
                  <div className="text-[11px] text-amber-800 mt-0.5">
                    Restores the realistic demonstration dataset (8 workers, 10 materials, 7 batches, 6 suppliers).
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-amber-900 bg-amber-200/80 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
                >
                  Reset Sample Data
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-red-50 border border-red-200">
                <div>
                  <div className="font-bold text-red-900 text-xs">Clear All Stored Records</div>
                  <div className="text-[11px] text-red-800 mt-0.5">
                    Deletes all employees, inventory, production batches, and activity logs from browser storage.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsClearConfirmOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 3: COLLEGE VIVA & PROJECT GUIDE ================= */}
      {activeTab === 'viva' && (
        <div className="space-y-6 max-w-4xl">
          {/* Project Summary Banner */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-6 text-white shadow-md">
            <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>College Mini / Major Project Documentation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mt-1">
              Industrial Management System (IMS)
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mt-2 leading-relaxed">
              A comprehensive ERP software prototype engineered to streamline industrial plant operations.
              It integrates workforce management, material inventory tracking with automatic low-stock alarms,
              manufacturing batch scheduling, supplier relations, and audit reporting.
            </p>
            <div className="mt-4 pt-4 border-t border-blue-800/80 flex flex-wrap gap-4 text-xs text-blue-200">
              <div><strong>Architecture:</strong> Single-Page Application (SPA)</div>
              <div><strong>Front-End:</strong> React 19 + TypeScript + Tailwind CSS</div>
              <div><strong>Persistence:</strong> HTML5 Web Storage API (localStorage)</div>
              <div><strong>Target Review:</strong> B.E / B.Tech / BCA / MCA Project Viva</div>
            </div>
          </div>

          {/* Key Modules & Capabilities */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FileCode className="w-4 h-4 text-blue-600" />
              <span>System Functional Modules Breakdown</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 mb-1">1. Operational Dashboard</div>
                <p className="text-slate-600 leading-relaxed">
                  Real-time KPI metric calculation (Active employees, inventory valuation, active batches, low-stock warnings),
                  interactive SVG throughput charts, category distribution, and live event audit feed.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 mb-1">2. Employee Management</div>
                <p className="text-slate-600 leading-relaxed">
                  Full CRUD with validation, departmental allocations, shift rosters (Morning/Evening/Night), contact records,
                  credential badges, and instant CSV roster export.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 mb-1">3. Inventory & Raw Materials</div>
                <p className="text-slate-600 leading-relaxed">
                  SKU tracking, reorder thresholds, automated low-stock warnings, storage bay locations, and quick stock adjustments
                  (+ / -) with reason logging for audit compliance.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 mb-1">4. Production Scheduling</div>
                <p className="text-slate-600 leading-relaxed">
                  Batch ID tracking, plant line routing, target vs. completed units, progress percentage calculation, supervisor
                  assignments, defect logging, and 1-click status transitions.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 mb-1">5. Supplier Directory</div>
                <p className="text-slate-600 leading-relaxed">
                  Vendor codes, reliability ratings (1-5 stars), delivery lead times, addresses, linked supplied materials,
                  and vendor registry maintenance.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 mb-1">6. Audit Reports & Print Engine</div>
                <p className="text-slate-600 leading-relaxed">
                  Multi-tab analytical audit ledgers, date filtering, formatted CSV serialization, and clean print engine
                  with official company letterhead and signature authorization lines.
                </p>
              </div>
            </div>
          </div>

          {/* Top 10 Viva Questions and Model Answers */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>Top 8 Viva Questions & Model Answers for Project Review</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900">
                  Q1: What is an Industrial Management System and what problem does it solve?
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  <strong>Answer:</strong> An Industrial Management System (IMS) or Manufacturing Execution System (MES)
                  bridges shop-floor physical operations with plant administration. It prevents line stoppages caused by unexpected
                  material stock-outs, eliminates paper-based shift tracking, coordinates batch production timelines, and provides
                  clear audit accountability for plant managers.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900">
                  Q2: How does the system detect and alert on low-stock conditions?
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  <strong>Answer:</strong> Each inventory record maintains a <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">minReorderLevel</code>.
                  Whenever stock is consumed in production or adjusted, a reactive selector computes:
                  <code className="block my-1 font-mono bg-white p-1.5 rounded border border-slate-200">
                    isLowStock = item.quantity &lt;= item.minReorderLevel && item.quantity &gt; 0
                  </code>
                  This condition instantly propagates through React Context to update the Dashboard KPI counters, the sidebar badge,
                  and the urgent warning banner.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900">
                  Q3: How is data persistence handled in this project without an external SQL server?
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  <strong>Answer:</strong> The application leverages the HTML5 <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">localStorage</code> API.
                  State updates are serialized to JSON strings with dedicated keys for each entity collection. When the app initializes,
                  it attempts to parse these keys; if empty, it seeds the initial realistic factory dataset.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900">
                  Q4: How does client-side CSV export work without third-party backend libraries?
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  <strong>Answer:</strong> In <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">src/utils/exportCsv.ts</code>, records are
                  transformed into comma-separated text with CSV value escaping (wrapping values containing commas or quotes in double-quotes).
                  A Blob with MIME type <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">text/csv;charset=utf-8;</code> is instantiated with a UTF-8 BOM
                  (<code className="font-mono bg-slate-200 px-1 py-0.5 rounded">\uFEFF</code>) to ensure proper character encoding in Microsoft Excel, and a temporary
                  anchor tag triggers the browser download.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900">
                  Q5: What is the lifecycle of a Production Batch in the system?
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  <strong>Answer:</strong> A batch begins in the <strong>Planned</strong> state. Once the supervisor authorizes raw material issue,
                  it transitions to <strong>In Progress</strong>. If machine maintenance or tool re-calibration is required, it can be paused to <strong>On Hold</strong>.
                  Upon passing quality control inspection, it is marked <strong>Completed</strong> and final completed quantities are credited to finished goods inventory.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900">
                  Q6: How does the printing feature format reports cleanly for physical paper?
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  <strong>Answer:</strong> The application uses CSS <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">@media print</code> rules.
                  Classes marked with <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">no-print</code> (sidebar, buttons, filters) are hidden via <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">display: none !important</code>,
                  while <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">print-only</code> blocks (official header, signatory lines) are revealed on white paper backgrounds.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={isResetConfirmOpen}
        title="Reset to Factory Sample Data"
        message="This will overwrite current edits and reload the default realistic dataset (8 employees, 10 inventory items, 7 production batches, and 6 suppliers). Proceed?"
        confirmText="Yes, Reset Data"
        isDangerous={false}
        onConfirm={() => {
          resetToSampleData();
          setIsResetConfirmOpen(false);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      {/* Clear Confirmation Modal */}
      <ConfirmationModal
        isOpen={isClearConfirmOpen}
        title="Clear All Browser Storage Data"
        message="Warning: This will delete ALL employee, inventory, production, supplier, and activity records from your browser's localStorage. Proceed with caution."
        confirmText="Yes, Clear Everything"
        isDangerous={true}
        onConfirm={() => {
          clearAllData();
          setIsClearConfirmOpen(false);
        }}
        onCancel={() => setIsClearConfirmOpen(false)}
      />
    </div>
  );
};
