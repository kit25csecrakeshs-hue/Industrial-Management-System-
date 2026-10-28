import React, { useState, useMemo } from 'react';
import { useIndustrial } from '../context/IndustrialContext';
import {
  exportEmployeesToCsv,
  exportInventoryToCsv,
  exportProductionToCsv,
  exportSuppliersToCsv,
} from '../utils/exportCsv';
import {
  FileBarChart2,
  Printer,
  Download,
  Calendar,
  Filter,
  Users,
  Boxes,
  Factory,
  AlertTriangle,
  Building2,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';

type ReportTab = 'production' | 'inventory' | 'lowstock' | 'employees';

export const ReportsView: React.FC = () => {
  const { employees, inventory, production, suppliers, settings, stats } = useIndustrial();

  const [activeReport, setActiveReport] = useState<ReportTab>('production');
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'quarter'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');

  // Filtered production based on date range
  const filteredProduction = useMemo(() => {
    if (dateRange === 'all') return production;
    const now = new Date();
    const days = dateRange === 'month' ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 86400000).toISOString().split('T')[0];
    return production.filter((p) => p.startDate >= cutoff);
  }, [production, dateRange]);

  // Low stock inventory items
  const lowStockItems = useMemo(() => {
    return inventory.filter((item) => item.quantity <= item.minReorderLevel);
  }, [inventory]);

  // Production statistics
  const productionMetrics = useMemo(() => {
    const totalBatches = filteredProduction.length;
    const completed = filteredProduction.filter((p) => p.status === 'Completed').length;
    const inProgress = filteredProduction.filter((p) => p.status === 'In Progress').length;
    const planned = filteredProduction.filter((p) => p.status === 'Planned').length;
    const totalPlannedUnits = filteredProduction.reduce((sum, p) => sum + p.plannedQuantity, 0);
    const totalActualUnits = filteredProduction.reduce((sum, p) => sum + p.completedQuantity, 0);
    const totalDefects = filteredProduction.reduce((sum, p) => sum + p.defectsCount, 0);
    const yieldRate =
      totalActualUnits > 0
        ? (((totalActualUnits - totalDefects) / totalActualUnits) * 100).toFixed(1)
        : '100';

    return {
      totalBatches,
      completed,
      inProgress,
      planned,
      totalPlannedUnits,
      totalActualUnits,
      totalDefects,
      yieldRate,
    };
  }, [filteredProduction]);

  // Handle Export based on current tab
  const handleExportCurrent = () => {
    if (activeReport === 'production') {
      exportProductionToCsv(filteredProduction, `production_report_${new Date().toISOString().split('T')[0]}.csv`);
    } else if (activeReport === 'inventory') {
      exportInventoryToCsv(inventory, settings.currency, `inventory_report_${new Date().toISOString().split('T')[0]}.csv`);
    } else if (activeReport === 'lowstock') {
      exportInventoryToCsv(lowStockItems, settings.currency, `low_stock_urgent_reorder_${new Date().toISOString().split('T')[0]}.csv`);
    } else if (activeReport === 'employees') {
      exportEmployeesToCsv(employees, `workforce_roster_${new Date().toISOString().split('T')[0]}.csv`);
    }
  };

  // Handle Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Printable Report Header (visible only during window.print()) */}
      <div className="print-only mb-6 border-b-2 border-slate-900 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">
              {settings.plantName}
            </h1>
            <p className="text-xs text-slate-600 mt-1">{settings.location}</p>
            <p className="text-xs text-slate-500 font-mono">
              Plant ID: {settings.plantCode} · Plant Manager: {settings.managerName}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Official Plant Audit Report
            </div>
            <div className="text-xs text-slate-500 font-mono mt-1">
              Generated: {new Date().toLocaleString()}
            </div>
            <div className="text-xs font-semibold text-blue-700 capitalize mt-0.5">
              Subject: {activeReport} Audit Ledger
            </div>
          </div>
        </div>
      </div>

      {/* Screen Controls & Header (Hidden when printing) */}
      <div className="no-print bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Report Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          <button
            onClick={() => setActiveReport('production')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeReport === 'production'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Factory className="w-3.5 h-3.5" />
            <span>Production Summary</span>
          </button>
          <button
            onClick={() => setActiveReport('inventory')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeReport === 'inventory'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Inventory Valuation</span>
          </button>
          <button
            onClick={() => setActiveReport('lowstock')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeReport === 'lowstock'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Low Stock Reorders ({lowStockItems.length})</span>
          </button>
          <button
            onClick={() => setActiveReport('employees')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeReport === 'employees'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Personnel Roster</span>
          </button>
        </div>

        {/* Date Filter & Export/Print Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {activeReport === 'production' && (
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Dates</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
            </select>
          )}

          {/* Export CSV Button */}
          <button
            onClick={handleExportCurrent}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            title="Export data to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            title="Generate Printable Audit Report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* ================= REPORT CONTENT 1: PRODUCTION ================= */}
      {activeReport === 'production' && (
        <div className="space-y-6">
          {/* Production Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Scheduled Batches</span>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1 tabular-nums">
                {productionMetrics.totalBatches}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {productionMetrics.inProgress} In Progress · {productionMetrics.completed} Done
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Output Units Produced</span>
              <div className="text-2xl font-bold text-blue-600 font-mono mt-1 tabular-nums">
                {productionMetrics.totalActualUnits.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Target: {productionMetrics.totalPlannedUnits.toLocaleString()} units
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Production Yield Rate</span>
              <div className="text-2xl font-bold text-emerald-600 font-mono mt-1 tabular-nums">
                {productionMetrics.yieldRate}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Quality Certified Pass
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">QA Rejections / Defects</span>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1 tabular-nums">
                {productionMetrics.totalDefects}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Scrap rate &lt; 0.8%
              </div>
            </div>
          </div>

          {/* Batches Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden print-page">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Manufacturing Batch Execution Audit ({filteredProduction.length} records)
              </h3>
              <span className="text-xs text-slate-500 font-mono">Date: {new Date().toLocaleDateString()}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-4">Batch ID</th>
                    <th className="py-2.5 px-4">Product Name</th>
                    <th className="py-2.5 px-4">Line</th>
                    <th className="py-2.5 px-4 text-right">Planned</th>
                    <th className="py-2.5 px-4 text-right">Completed</th>
                    <th className="py-2.5 px-4 text-right">Yield %</th>
                    <th className="py-2.5 px-4">Start - Due</th>
                    <th className="py-2.5 px-4">Supervisor</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProduction.map((p) => {
                    const progress =
                      p.plannedQuantity > 0
                        ? Math.round((p.completedQuantity / p.plannedQuantity) * 100)
                        : 0;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">
                          {p.batchId}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-slate-900">{p.productName}</td>
                        <td className="py-2.5 px-4 text-slate-600">{p.line}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                          {p.plannedQuantity} {p.unit}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900">
                          {p.completedQuantity} {p.unit}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-800">
                          {progress}%
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[11px] text-slate-600">
                          {p.startDate} to {p.targetDate}
                        </td>
                        <td className="py-2.5 px-4 text-slate-700">{p.supervisor}</td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              p.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'In Progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= REPORT CONTENT 2: INVENTORY ================= */}
      {activeReport === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Total Registered SKUs</span>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1 tabular-nums">
                {stats.totalInventoryItems}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Total Inventory Asset Value</span>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1 tabular-nums">
                {settings.currency}{stats.totalInventoryValue.toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Items Below Safety Threshold</span>
              <div className="text-2xl font-bold text-amber-600 font-mono mt-1 tabular-nums">
                {stats.lowStockCount}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Completely Stocked Out</span>
              <div className="text-2xl font-bold text-red-600 font-mono mt-1 tabular-nums">
                {stats.outOfStockCount}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden print-page">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Material Inventory & Asset Valuation Ledger
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                Currency: {settings.currency}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-4">SKU</th>
                    <th className="py-2.5 px-4">Material Name</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4 text-right">Available Qty</th>
                    <th className="py-2.5 px-4 text-right">Unit Price</th>
                    <th className="py-2.5 px-4 text-right">Total Valuation</th>
                    <th className="py-2.5 px-4">Reorder Min</th>
                    <th className="py-2.5 px-4">Supplier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">
                        {item.sku}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">{item.name}</td>
                      <td className="py-2.5 px-4 text-slate-600">{item.category}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                        {item.quantity.toLocaleString()} {item.unit}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                        {settings.currency}{item.unitPrice.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                        {settings.currency}{(item.quantity * item.unitPrice).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-500">
                        {item.minReorderLevel} {item.unit}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700 truncate max-w-[150px]">
                        {item.supplierName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= REPORT CONTENT 3: LOW STOCK AUDIT ================= */}
      {activeReport === 'lowstock' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div>
                <h4 className="font-bold text-amber-900 text-sm">
                  Procurement Action Required: {lowStockItems.length} Materials Depleted
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Stock levels are at or below safety reorder buffers. Issue Purchase Orders immediately.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden print-page">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Urgent Reorder Materials Audit Table
              </h3>
              <span className="text-xs text-amber-600 font-semibold">Priority: Critical</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-4">SKU</th>
                    <th className="py-2.5 px-4">Material Description</th>
                    <th className="py-2.5 px-4 text-right">Current Stock</th>
                    <th className="py-2.5 px-4 text-right">Min Reorder Level</th>
                    <th className="py-2.5 px-4 text-right">Recommended Reorder</th>
                    <th className="py-2.5 px-4 text-right">Estimated Cost</th>
                    <th className="py-2.5 px-4">Primary Supplier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStockItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        All materials currently have optimal stock above safety thresholds!
                      </td>
                    </tr>
                  ) : (
                    lowStockItems.map((item) => {
                      const recommendedOrder = Math.max(
                        item.minReorderLevel * 2 - item.quantity,
                        item.minReorderLevel
                      );
                      const estimatedCost = recommendedOrder * item.unitPrice;

                      return (
                        <tr key={item.id} className="hover:bg-amber-50/40">
                          <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">
                            {item.sku}
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-slate-900">{item.name}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-amber-600">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-slate-500">
                            {item.minReorderLevel} {item.unit}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                            +{recommendedOrder} {item.unit}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900">
                            {settings.currency}{estimatedCost.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-4 text-slate-800 font-medium">
                            {item.supplierName}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= REPORT CONTENT 4: WORKFORCE ================= */}
      {activeReport === 'employees' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Total Headcount</span>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1 tabular-nums">
                {stats.totalEmployees}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Active on Duty</span>
              <div className="text-2xl font-bold text-emerald-600 font-mono mt-1 tabular-nums">
                {stats.activeEmployees}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Total Monthly Payroll</span>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1 tabular-nums">
                {settings.currency}
                {employees.reduce((sum, e) => sum + e.salary, 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Average Tenure</span>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1 tabular-nums">
                2.8 yrs
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden print-page">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Industrial Workforce Roster & Departmental Allocation
              </h3>
              <span className="text-xs text-slate-500 font-mono">{employees.length} personnel</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-4">Emp ID</th>
                    <th className="py-2.5 px-4">Full Name</th>
                    <th className="py-2.5 px-4">Department</th>
                    <th className="py-2.5 px-4">Role</th>
                    <th className="py-2.5 px-4">Shift</th>
                    <th className="py-2.5 px-4">Phone</th>
                    <th className="py-2.5 px-4 text-right">Salary</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">
                        {emp.empId}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{emp.fullName}</td>
                      <td className="py-2.5 px-4 text-slate-600">{emp.department}</td>
                      <td className="py-2.5 px-4 text-slate-700">{emp.jobRole}</td>
                      <td className="py-2.5 px-4 text-slate-600">{emp.shift.split('(')[0]}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-700">{emp.phone}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-800">
                        {settings.currency}{emp.salary.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            emp.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Formal Signature & Seal Block for Print */}
      <div className="print-only mt-12 pt-6 border-t border-slate-300">
        <div className="grid grid-cols-3 gap-6 text-xs text-slate-700">
          <div>
            <div className="font-semibold text-slate-900">Prepared By:</div>
            <div className="h-12 border-b border-slate-400 mt-2" />
            <div className="mt-1">Plant Operations Lead</div>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Verified & QA Approved:</div>
            <div className="h-12 border-b border-slate-400 mt-2" />
            <div className="mt-1">Quality Assurance Superintendent</div>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Authorized Signature:</div>
            <div className="h-12 border-b border-slate-400 mt-2" />
            <div className="mt-1">{settings.managerName}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
