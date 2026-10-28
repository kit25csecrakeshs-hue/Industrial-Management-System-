import React, { useState, useMemo } from 'react';
import { useIndustrial } from '../context/IndustrialContext';
import { ProductionRecord, ProductionStatus, Shift, InventoryUnit } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { exportProductionToCsv } from '../utils/exportCsv';
import {
  Factory,
  Search,
  Plus,
  Download,
  Edit2,
  Trash2,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Clock,
  AlertCircle,
  Calendar,
  X,
  Layers,
  UserCheck,
} from 'lucide-react';

const STATUS_TABS: { id: string; label: string }[] = [
  { id: 'ALL', label: 'All Batches' },
  { id: 'In Progress', label: 'In Progress' },
  { id: 'Planned', label: 'Planned' },
  { id: 'Completed', label: 'Completed' },
  { id: 'On Hold', label: 'On Hold' },
];

const PRODUCTION_LINES = [
  'Line 1 - Heavy Forge & Press',
  'Line 2 - Precision Machining Bay',
  'Line 3 - Sub-Assembly & Testing',
  'Line 4 - Coating & Packaging',
  'Line 5 - Heat Treatment Furnace',
];

const UNITS: InventoryUnit[] = ['Units', 'Tonnes', 'kg', 'Liters', 'Boxes', 'Meters'];

const SHIFTS: Shift[] = [
  'Morning (06:00 - 14:00)',
  'Evening (14:00 - 22:00)',
  'Night (22:00 - 06:00)',
];

export const ProductionView: React.FC = () => {
  const {
    production,
    employees,
    addProductionRecord,
    updateProductionRecord,
    deleteProductionRecord,
    advanceProductionStatus,
    stats,
  } = useIndustrial();

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState('ALL');
  const [selectedLine, setSelectedLine] = useState('ALL');

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ProductionRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<ProductionRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    batchId: '',
    productName: '',
    line: 'Line 1 - Heavy Forge & Press',
    plannedQuantity: 200,
    completedQuantity: 0,
    unit: 'Units' as InventoryUnit,
    startDate: new Date().toISOString().split('T')[0],
    targetDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    status: 'Planned' as ProductionStatus,
    supervisor: '',
    shift: 'Morning (06:00 - 14:00)' as Shift,
    defectsCount: 0,
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filtered Production Records
  const filteredProduction = useMemo(() => {
    return production.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.batchId.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        item.supervisor.toLowerCase().includes(q) ||
        item.line.toLowerCase().includes(q);

      const matchesStatus =
        selectedStatusTab === 'ALL' || item.status === selectedStatusTab;
      const matchesLine = selectedLine === 'ALL' || item.line === selectedLine;

      return matchesSearch && matchesStatus && matchesLine;
    });
  }, [production, searchQuery, selectedStatusTab, selectedLine]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingRecord(null);
    const nextBatchNum = String(production.length + 44).padStart(3, '0');
    const productionEmployees = employees.filter((e) => e.department === 'Production' || e.department === 'Quality Control');
    const defaultSupervisor = productionEmployees[0]?.fullName || 'Vikramjit Singh';

    setFormData({
      batchId: `BATCH-2026-${nextBatchNum}`,
      productName: '',
      line: 'Line 1 - Heavy Forge & Press',
      plannedQuantity: 250,
      completedQuantity: 0,
      unit: 'Units',
      startDate: new Date().toISOString().split('T')[0],
      targetDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'Planned',
      supervisor: defaultSupervisor,
      shift: 'Morning (06:00 - 14:00)',
      defectsCount: 0,
      notes: '',
    });
    setFormErrors({});
    setIsAddEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (rec: ProductionRecord) => {
    setEditingRecord(rec);
    setFormData({
      batchId: rec.batchId,
      productName: rec.productName,
      line: rec.line,
      plannedQuantity: rec.plannedQuantity,
      completedQuantity: rec.completedQuantity,
      unit: rec.unit,
      startDate: rec.startDate,
      targetDate: rec.targetDate,
      status: rec.status,
      supervisor: rec.supervisor,
      shift: rec.shift,
      defectsCount: rec.defectsCount,
      notes: rec.notes || '',
    });
    setFormErrors({});
    setIsAddEditModalOpen(true);
  };

  // Form Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.batchId.trim()) errors.batchId = 'Batch ID is required';
    if (!formData.productName.trim()) errors.productName = 'Product name is required';
    if (formData.plannedQuantity <= 0) errors.plannedQuantity = 'Planned quantity must be greater than 0';
    if (formData.completedQuantity < 0) errors.completedQuantity = 'Completed quantity cannot be negative';
    if (formData.completedQuantity > formData.plannedQuantity) {
      errors.completedQuantity = 'Completed quantity cannot exceed planned quantity';
    }
    if (!formData.supervisor.trim()) errors.supervisor = 'Assigned supervisor is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingRecord) {
      updateProductionRecord(editingRecord.id, formData);
    } else {
      addProductionRecord(formData);
    }
    setIsAddEditModalOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deletingRecord) {
      deleteProductionRecord(deletingRecord.id);
      setDeletingRecord(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Production Top KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Total Batches</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono mt-1 tabular-nums">
            {stats.totalProductionBatches}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">In Progress</div>
          <div className="text-xl sm:text-2xl font-bold text-blue-600 font-mono mt-1 tabular-nums">
            {stats.inProgressBatchesCount}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Completed Runs</div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 font-mono mt-1 tabular-nums">
            {stats.completedBatchesCount}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Total Output Produced</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono mt-1 tabular-nums">
            {stats.totalCompletedUnits.toLocaleString()} units
          </div>
        </div>
      </div>

      {/* Control Header & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Batch ID, product, supervisor, or line..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
          />
        </div>

        {/* Filters and CTA */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Manufacturing Line Filter */}
          <select
            value={selectedLine}
            onChange={(e) => setSelectedLine(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Manufacturing Lines</option>
            {PRODUCTION_LINES.map((line) => (
              <option key={line} value={line}>
                {line}
              </option>
            ))}
          </select>

          {/* Export CSV */}
          <button
            type="button"
            onClick={() => exportProductionToCsv(filteredProduction)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            title="Download CSV Batch Schedule"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Schedule Batch Button */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Batch</span>
          </button>
        </div>
      </div>

      {/* Status Segmented Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg overflow-x-auto w-fit">
        {STATUS_TABS.map((tab) => {
          const count =
            tab.id === 'ALL'
              ? production.length
              : production.filter((p) => p.status === tab.id).length;

          return (
            <button
              key={tab.id}
              onClick={() => setSelectedStatusTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedStatusTab === tab.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Production Batches Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Factory className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Batch Schedules & Progress ({filteredProduction.length} batches)
            </h3>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-blue-600 hover:underline"
            >
              Clear search
            </button>
          )}
        </div>

        {filteredProduction.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Factory className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">No production batches found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              No manufacturing batches match your current filters or search query.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule First Batch</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Batch ID</th>
                  <th className="py-3 px-4">Product & Manufacturing Line</th>
                  <th className="py-3 px-4 text-right">Target vs Done</th>
                  <th className="py-3 px-4">Timeline</th>
                  <th className="py-3 px-4">Supervisor & Shift</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Workflow Transition</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProduction.map((p) => {
                  const progress =
                    p.plannedQuantity > 0
                      ? Math.round((p.completedQuantity / p.plannedQuantity) * 100)
                      : 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        {p.batchId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{p.productName}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{p.line}</div>
                        {p.notes && (
                          <div className="text-[10px] text-slate-400 italic line-clamp-1 mt-0.5">
                            {p.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 tabular-nums">
                          {p.completedQuantity} / {p.plannedQuantity} {p.unit}
                        </div>
                        <div className="flex items-center justify-end gap-1.5 mt-1">
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                progress >= 100
                                  ? 'bg-emerald-500'
                                  : progress > 50
                                  ? 'bg-blue-600'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(100, progress)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-semibold text-slate-500">
                            {progress}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{p.startDate}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Due: {p.targetDate}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{p.supervisor}</div>
                        <div className="text-[10px] text-slate-500">{p.shift.split('(')[0]}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                            p.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-800'
                              : p.status === 'On Hold'
                              ? 'bg-amber-100 text-amber-800'
                              : p.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {p.status === 'Planned' && (
                            <button
                              onClick={() => advanceProductionStatus(p.id, 'In Progress')}
                              className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors flex items-center gap-1"
                              title="Start production run"
                            >
                              <Play className="w-3 h-3" />
                              <span>Start Run</span>
                            </button>
                          )}
                          {p.status === 'In Progress' && (
                            <>
                              <button
                                onClick={() => advanceProductionStatus(p.id, 'Completed')}
                                className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors flex items-center gap-1"
                                title="Mark Completed"
                              >
                                <CheckCircle className="w-3 h-3" />
                                <span>Complete</span>
                              </button>
                              <button
                                onClick={() => advanceProductionStatus(p.id, 'On Hold')}
                                className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                                title="Put On Hold"
                              >
                                <Pause className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {p.status === 'On Hold' && (
                            <button
                              onClick={() => advanceProductionStatus(p.id, 'In Progress')}
                              className="px-2.5 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded hover:bg-amber-100 transition-colors flex items-center gap-1"
                              title="Resume batch"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Resume</span>
                            </button>
                          )}
                          {p.status === 'Completed' && (
                            <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-semibold">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Verified</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                            title="Edit Batch"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingRecord(p)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Batch"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Production Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Factory className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {editingRecord ? `Modify Production Run (${editingRecord.batchId})` : 'Schedule Production Batch'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Batch ID */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Batch ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.batchId}
                    onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                    className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono ${
                      formErrors.batchId ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder="e.g. BATCH-2026-050"
                  />
                  {formErrors.batchId && (
                    <p className="text-[10px] text-red-600 mt-1">{formErrors.batchId}</p>
                  )}
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Product / Component Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      formErrors.productName ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder="e.g. High-Pressure Weld Neck Flanges"
                  />
                  {formErrors.productName && (
                    <p className="text-[10px] text-red-600 mt-1">{formErrors.productName}</p>
                  )}
                </div>

                {/* Line */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Production Plant / Bay Line *
                  </label>
                  <select
                    value={formData.line}
                    onChange={(e) => setFormData({ ...formData, line: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {PRODUCTION_LINES.map((line) => (
                      <option key={line} value={line}>
                        {line}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Planned Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Planned Batch Target *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.plannedQuantity}
                    onChange={(e) => setFormData({ ...formData, plannedQuantity: Number(e.target.value) })}
                    className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono ${
                      formErrors.plannedQuantity ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.plannedQuantity && (
                    <p className="text-[10px] text-red-600 mt-1">{formErrors.plannedQuantity}</p>
                  )}
                </div>

                {/* Completed Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Actual Completed Output
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.completedQuantity}
                    onChange={(e) => setFormData({ ...formData, completedQuantity: Number(e.target.value) })}
                    className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono ${
                      formErrors.completedQuantity ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.completedQuantity && (
                    <p className="text-[10px] text-red-600 mt-1">{formErrors.completedQuantity}</p>
                  )}
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unit of Measurement
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as InventoryUnit })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Batch Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductionStatus })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Run Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Target Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Completion Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Supervisor */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Foreman / Supervisor *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.supervisor}
                    onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                    className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      formErrors.supervisor ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder="e.g. Vikramjit Singh"
                  />
                </div>

                {/* Shift */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Operating Shift
                  </label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value as Shift })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {SHIFTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Defects Count */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    QA Rejected / Defect Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.defectsCount}
                    onChange={(e) => setFormData({ ...formData, defectsCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Batch Work Order Instructions / Observations
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Machining tolerance, heat treatment dwell time, pressure test parameters..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  {editingRecord ? 'Update Batch Record' : 'Schedule Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deletingRecord)}
        title="Delete Production Batch"
        message={`Are you sure you want to delete batch ${deletingRecord?.batchId} (${deletingRecord?.productName})? This action cannot be reversed.`}
        confirmText="Yes, Delete Batch"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingRecord(null)}
      />
    </div>
  );
};
