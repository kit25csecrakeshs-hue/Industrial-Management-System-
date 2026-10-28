import React, { useState } from 'react';
import { useIndustrial } from '../context/IndustrialContext';
import {
  Users,
  Boxes,
  Factory,
  AlertTriangle,
  TrendingUp,
  Plus,
  ArrowRight,
  Package,
  CheckCircle,
  Clock,
  ChevronRight,
  BarChart3,
  Calendar,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    stats,
    production,
    inventory,
    activities,
    settings,
    setActiveTab,
    advanceProductionStatus,
    adjustStock,
  } = useIndustrial();

  const [selectedChartRange, setSelectedChartRange] = useState<'week' | 'month'>('week');
  const [restockModalItem, setRestockModalItem] = useState<{ id: string; name: string; unit: string } | null>(null);
  const [restockQty, setRestockQty] = useState<number>(50);

  // Group inventory by category for category breakdown
  const categoryStats = React.useMemo(() => {
    const map: Record<string, { count: number; value: number }> = {};
    inventory.forEach((item) => {
      if (!map[item.category]) {
        map[item.category] = { count: 0, value: 0 };
      }
      map[item.category].count += 1;
      map[item.category].value += item.quantity * item.unitPrice;
    });
    return Object.entries(map).map(([category, data]) => ({
      category,
      count: data.count,
      value: data.value,
    }));
  }, [inventory]);

  // Production chart data simulation based on real records
  const weeklyProductionData = [
    { label: 'Mon', target: 120, actual: 110 },
    { label: 'Tue', target: 140, actual: 145 },
    { label: 'Wed', target: 150, actual: 135 },
    { label: 'Thu', target: 130, actual: 130 },
    { label: 'Fri', target: 160, actual: 170 },
    { label: 'Sat', target: 90, actual: 95 },
    { label: 'Sun', target: 40, actual: 35 },
  ];

  const monthlyProductionData = [
    { label: 'Wk 1', target: 700, actual: 680 },
    { label: 'Wk 2', target: 750, actual: 790 },
    { label: 'Wk 3', target: 800, actual: 760 },
    { label: 'Wk 4', target: 820, actual: 840 },
  ];

  const chartData = selectedChartRange === 'week' ? weeklyProductionData : monthlyProductionData;
  const maxVal = Math.max(...chartData.flatMap((d) => [d.target, d.actual]), 100);

  const handleQuickRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (restockModalItem && restockQty > 0) {
      adjustStock(restockModalItem.id, restockQty, 'Emergency stock inward via dashboard');
      setRestockModalItem(null);
      setRestockQty(50);
    }
  };

  return (
    <div className="space-y-6">
      {/* Critical Low Stock Banner */}
      {stats.lowStockCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-300 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-amber-500 text-white shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                  Attention: {stats.lowStockCount} Inventory Item{stats.lowStockCount > 1 ? 's' : ''} Below Reorder Threshold
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                  Urgent Reorder
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {stats.lowStockItems.map((i) => `${i.name} (${i.quantity} ${i.unit} left)`).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('inventory')}
            className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 whitespace-nowrap self-stretch sm:self-auto justify-center"
          >
            <span>Resolve in Inventory</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Employees */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Total Employees
            </span>
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {stats.totalEmployees}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
              <span className="font-medium text-emerald-600">{stats.activeEmployees} Active on Duty</span>
              <span aria-hidden="true">·</span>
              <span>{stats.totalEmployees - stats.activeEmployees} On Leave</span>
            </div>
          </div>
        </div>

        {/* Card 2: Inventory Items */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Inventory SKU Items
            </span>
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {stats.totalInventoryItems}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                {settings.currency}{stats.totalInventoryValue.toLocaleString()}
              </span>
              <span>Total Valuation</span>
            </div>
          </div>
        </div>

        {/* Card 3: Production Records */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Production Batches
            </span>
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Factory className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {stats.totalProductionBatches}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
              <span className="font-medium text-blue-600">{stats.inProgressBatchesCount} In Progress</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-emerald-600">{stats.completedBatchesCount} Completed</span>
            </div>
          </div>
        </div>

        {/* Card 4: Low Stock Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Low Stock Alerts
            </span>
            <div className={`p-2.5 rounded-lg ${stats.lowStockCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${stats.lowStockCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {stats.lowStockCount}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
              <span>{stats.outOfStockCount > 0 ? `${stats.outOfStockCount} Out of Stock` : '0 Depleted to zero'}</span>
              <span aria-hidden="true">·</span>
              <span>Threshold: {settings.defaultLowStockThreshold}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Production Throughput Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Production Output & Target Analysis</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparison between planned capacity vs. actual manufacturing output
              </p>
            </div>

            {/* Range Toggle */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setSelectedChartRange('week')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedChartRange === 'week'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7-Day Output
              </button>
              <button
                type="button"
                onClick={() => setSelectedChartRange('month')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedChartRange === 'month'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Weeks
              </button>
            </div>
          </div>

          {/* SVG Bar Chart Visualization */}
          <div className="py-6">
            <div className="flex items-end justify-between gap-2 sm:gap-4 h-52 pt-6">
              {chartData.map((d, idx) => {
                const targetHeight = Math.max(12, Math.round((d.target / maxVal) * 160));
                const actualHeight = Math.max(12, Math.round((d.actual / maxVal) * 160));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="w-full max-w-[42px] flex items-end justify-center gap-1.5 h-44 pb-1">
                      {/* Target bar */}
                      <div
                        style={{ height: `${targetHeight}px` }}
                        className="w-1/2 bg-slate-200 rounded-t-sm transition-all group-hover:bg-slate-300 relative"
                        title={`Target: ${d.target} units`}
                      />
                      {/* Actual bar */}
                      <div
                        style={{ height: `${actualHeight}px` }}
                        className="w-1/2 bg-blue-600 rounded-t-sm transition-all group-hover:bg-blue-700 relative"
                        title={`Actual: ${d.actual} units`}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                          {d.actual}u
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-600 mt-2 font-mono">
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-slate-300 rounded-xs" />
                <span>Planned Target</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-600 rounded-xs" />
                <span className="font-semibold text-slate-800">Actual Output Produced</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Overall Plant Yield Efficiency: <strong className="text-slate-800 font-mono">98.4%</strong></span>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <span>Detailed Report</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right 1 Col: Inventory Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Inventory by Category</h3>
              <span className="text-xs text-slate-500 font-mono">{categoryStats.length} Classes</span>
            </div>

            <div className="mt-4 space-y-3.5">
              {categoryStats.map((cat, i) => {
                const totalVal = stats.totalInventoryValue || 1;
                const percentage = Math.round((cat.value / totalVal) * 100);

                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 line-clamp-1">{cat.category}</span>
                      <span className="font-mono text-slate-500 tabular-nums">
                        {settings.currency}{cat.value.toLocaleString()} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${Math.max(5, percentage)}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {cat.count} distinct item{cat.count > 1 ? 's' : ''} in stock
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('inventory')}
              className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <span>Manage All Material Records</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Lower Section: Recent Batches & Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active & Recent Production Batches */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Factory className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Active Manufacturing Batches
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('production')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All Batches</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Batch ID</th>
                  <th className="py-3 px-4">Product & Line</th>
                  <th className="py-3 px-4 text-right">Progress</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {production.slice(0, 5).map((p) => {
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
                        <div className="font-medium text-slate-900 line-clamp-1">{p.productName}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{p.line}</div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="font-mono tabular-nums font-semibold text-slate-800">
                          {p.completedQuantity} / {p.plannedQuantity} {p.unit}
                        </div>
                        <div className="w-24 ml-auto h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${
                              progress >= 100 ? 'bg-emerald-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${Math.min(100, progress)}%` }}
                          />
                        </div>
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
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {p.status === 'Planned' && (
                          <button
                            onClick={() => advanceProductionStatus(p.id, 'In Progress')}
                            className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                          >
                            Start Run
                          </button>
                        )}
                        {p.status === 'In Progress' && (
                          <button
                            onClick={() => advanceProductionStatus(p.id, 'Completed')}
                            className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors"
                          >
                            Complete
                          </button>
                        )}
                        {p.status === 'Completed' && (
                          <span className="text-[11px] text-slate-600 flex items-center justify-end gap-1 font-medium">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Finished</span>
                          </span>
                        )}
                        {p.status === 'On Hold' && (
                          <button
                            onClick={() => advanceProductionStatus(p.id, 'In Progress')}
                            className="px-2.5 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded hover:bg-amber-100 transition-colors"
                          >
                            Resume
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Recent Activity Stream */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Operational Event Log
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Live Audit</span>
          </div>

          <div className="p-4 flex-1 overflow-y-auto max-h-[380px] space-y-3.5">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No recent activity recorded.
              </div>
            ) : (
              activities.slice(0, 8).map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-800 font-medium leading-snug">
                      {act.description}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-mono">
                      <span>{act.timestamp}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-500">{act.user}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-blue-600">{act.module}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-500">
              Auto-logged with browser localStorage persistence
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stock Modal */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleQuickRestockSubmit}
            className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm p-5 space-y-4"
          >
            <h4 className="font-bold text-slate-900 text-sm">
              Quick Restock: {restockModalItem.name}
            </h4>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity to Inward ({restockModalItem.unit})
              </label>
              <input
                type="number"
                min="1"
                required
                value={restockQty}
                onChange={(e) => setRestockQty(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRestockModalItem(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                Confirm Inward
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
