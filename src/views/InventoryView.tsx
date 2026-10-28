import React, { useState, useMemo } from 'react';
import { useIndustrial } from '../context/IndustrialContext';
import { InventoryItem, InventoryCategory, InventoryUnit } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { exportInventoryToCsv } from '../utils/exportCsv';
import {
  Boxes,
  Search,
  Plus,
  Download,
  Edit2,
  Trash2,
  AlertTriangle,
  ArrowUpDown,
  PlusCircle,
  MinusCircle,
  X,
  Package,
  Layers,
  MapPin,
  TrendingDown,
} from 'lucide-react';

const CATEGORIES: InventoryCategory[] = [
  'Raw Metals & Alloys',
  'Chemicals & Polymers',
  'Mechanical Components',
  'Electrical & Sensors',
  'Packaging & Supplies',
  'Finished Goods',
];

const UNITS: InventoryUnit[] = ['kg', 'Tonnes', 'Liters', 'Units', 'Meters', 'Boxes', 'Rolls'];

export const InventoryView: React.FC = () => {
  const {
    inventory,
    suppliers,
    settings,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    adjustStock,
    stats,
  } = useIndustrial();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState<'ALL' | 'LOW' | 'OPTIMAL' | 'DEPLETED'>('ALL');

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);
  const [adjustStockItem, setAdjustStockItem] = useState<InventoryItem | null>(null);

  // Quick adjust form state
  const [adjustDelta, setAdjustDelta] = useState<number>(10);
  const [adjustDirection, setAdjustDirection] = useState<'add' | 'subtract'>('add');
  const [adjustReason, setAdjustReason] = useState<string>('Vendor shipment inward');

  // Form state for Add/Edit
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Raw Metals & Alloys' as InventoryCategory,
    quantity: 100,
    unit: 'Units' as InventoryUnit,
    unitPrice: 500,
    minReorderLevel: 50,
    location: '',
    supplierName: '',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.supplierName.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;

      let matchesStock = true;
      if (stockStatusFilter === 'LOW') {
        matchesStock = item.quantity <= item.minReorderLevel && item.quantity > 0;
      } else if (stockStatusFilter === 'DEPLETED') {
        matchesStock = item.quantity <= 0;
      } else if (stockStatusFilter === 'OPTIMAL') {
        matchesStock = item.quantity > item.minReorderLevel;
      }

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [inventory, searchQuery, selectedCategory, stockStatusFilter]);

  // Open modal for Create
  const handleOpenAddModal = () => {
    setEditingItem(null);
    const nextSkuNum = String(inventory.length + 101).padStart(3, '0');
    setFormData({
      sku: `SKU-MAT-${nextSkuNum}`,
      name: '',
      category: 'Raw Metals & Alloys',
      quantity: 100,
      unit: 'Units',
      unitPrice: 450,
      minReorderLevel: 40,
      location: 'Warehouse Bay 2',
      supplierName: suppliers[0]?.companyName || 'General Industrial Supplier',
      notes: '',
    });
    setFormErrors({});
    setIsAddEditModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      sku: item.sku,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      minReorderLevel: item.minReorderLevel,
      location: item.location,
      supplierName: item.supplierName,
      notes: item.notes || '',
    });
    setFormErrors({});
    setIsAddEditModalOpen(true);
  };

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.sku.trim()) errors.sku = 'Item SKU is required';
    if (!formData.name.trim()) errors.name = 'Material / Product Name is required';
    if (formData.quantity < 0) errors.quantity = 'Quantity cannot be negative';
    if (formData.unitPrice <= 0) errors.unitPrice = 'Price must be greater than 0';
    if (formData.minReorderLevel < 0) errors.minReorderLevel = 'Reorder level cannot be negative';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Add/Edit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingItem) {
      updateInventoryItem(editingItem.id, formData);
    } else {
      addInventoryItem(formData);
    }
    setIsAddEditModalOpen(false);
  };

  // Handle Quick Adjust Submit
  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adjustStockItem && adjustDelta > 0) {
      const delta = adjustDirection === 'add' ? adjustDelta : -adjustDelta;
      adjustStock(adjustStockItem.id, delta, adjustReason);
      setAdjustStockItem(null);
      setAdjustDelta(10);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deletingItem) {
      deleteInventoryItem(deletingItem.id);
      setDeletingItem(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Inventory KPI Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Total Inventory SKUs</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono mt-1 tabular-nums">
            {stats.totalInventoryItems}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Total Stock Valuation</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono mt-1 tabular-nums">
            {settings.currency}{stats.totalInventoryValue.toLocaleString()}
          </div>
        </div>

        <div className={`rounded-xl border p-4 shadow-xs ${stats.lowStockCount > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-white border-slate-200'}`}>
          <div className="text-amber-800 text-xs font-medium flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Low Stock Alerts</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-900 font-mono mt-1 tabular-nums">
            {stats.lowStockCount}
          </div>
        </div>

        <div className={`rounded-xl border p-4 shadow-xs ${stats.outOfStockCount > 0 ? 'bg-red-50/70 border-red-200' : 'bg-white border-slate-200'}`}>
          <div className="text-red-800 text-xs font-medium flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-red-600" />
            <span>Out of Stock</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-red-900 font-mono mt-1 tabular-nums">
            {stats.outOfStockCount}
          </div>
        </div>
      </div>

      {/* Control Header & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search material by name, SKU, location, or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
          />
        </div>

        {/* Filters and CTA Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Stock Condition Filter */}
          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="LOW">Low Stock (≤ Reorder)</option>
            <option value="DEPLETED">Out of Stock (0)</option>
            <option value="OPTIMAL">Adequate Stock</option>
          </select>

          {/* Export CSV */}
          <button
            type="button"
            onClick={() => exportInventoryToCsv(filteredInventory, settings.currency)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            title="Download CSV Inventory Ledger"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Add Item Button */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Material / SKU</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Warehouse Materials Ledger ({filteredInventory.length} items)
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

        {filteredInventory.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Boxes className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">No inventory records found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              No materials match your current search terms or filter selection.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Inventory Record</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">SKU / Code</th>
                  <th className="py-3 px-4">Material Name & Category</th>
                  <th className="py-3 px-4 text-right">Available Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Total Value</th>
                  <th className="py-3 px-4">Storage Location</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.map((item) => {
                  const isLow = item.quantity <= item.minReorderLevel && item.quantity > 0;
                  const isDepleted = item.quantity <= 0;
                  const valuation = item.quantity * item.unitPrice;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isDepleted ? 'bg-red-50/30' : isLow ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        {item.sku}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{item.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate max-w-[150px]">{item.supplierName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 tabular-nums">
                          {item.quantity.toLocaleString()} {item.unit}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Min: {item.minReorderLevel} {item.unit}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-slate-700">
                        {settings.currency}{item.unitPrice.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-semibold text-slate-900">
                        {settings.currency}{valuation.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono text-[11px]">{item.location || 'Yard'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isDepleted ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3" />
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Optimal
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setAdjustStockItem(item);
                              setAdjustDelta(10);
                              setAdjustDirection('add');
                              setAdjustReason('Shipment inward');
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Adjust Stock (+ / -)"
                          >
                            <ArrowUpDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                            title="Edit Material"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingItem(item)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Material"
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

      {/* Add / Edit Inventory Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {editingItem ? `Edit Material Record (${editingItem.sku})` : 'Add New Inventory Material / SKU'}
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
                {/* SKU */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    SKU / Part Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono ${
                      formErrors.sku ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder="e.g. SKU-RAW-105"
                  />
                  {formErrors.sku && (
                    <p className="text-[10px] text-red-600 mt-1">{formErrors.sku}</p>
                  )}
                </div>

                {/* Material Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Material / Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      formErrors.name ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder="e.g. Carbon Steel Plates 12mm"
                  />
                  {formErrors.name && (
                    <p className="text-[10px] text-red-600 mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as InventoryCategory })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Storage Unit */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unit of Measurement *
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

                {/* Current Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantity in Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono ${
                      formErrors.quantity ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.quantity && (
                    <p className="text-[10px] text-red-600 mt-1">{formErrors.quantity}</p>
                  )}
                </div>

                {/* Unit Cost */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unit Price / Cost ({settings.currency}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono ${
                      formErrors.unitPrice ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.unitPrice && (
                    <p className="text-[10px] text-red-600 mt-1">{formErrors.unitPrice}</p>
                  )}
                </div>

                {/* Minimum Reorder Level */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Minimum Reorder Threshold *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.minReorderLevel}
                    onChange={(e) => setFormData({ ...formData, minReorderLevel: Number(e.target.value) })}
                    className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono ${
                      formErrors.minReorderLevel ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Triggers low stock warnings when reached.</p>
                </div>

                {/* Storage Location */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Warehouse Bin / Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="e.g. Rack B-04 / Bin 12"
                  />
                </div>

                {/* Supplier */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Supplier / Vendor
                  </label>
                  <input
                    type="text"
                    value={formData.supplierName}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Bharat Forge & Steel Mills Ltd"
                  />
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Technical Specifications / Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional details like material grade, coating, tensile test certificate..."
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
                  {editingItem ? 'Save Changes' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Stock Adjustment Modal */}
      {adjustStockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Adjust Stock Level</h3>
              </div>
              <button
                onClick={() => setAdjustStockItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                <div className="font-semibold text-slate-900">{adjustStockItem.name}</div>
                <div className="text-slate-500 font-mono mt-0.5">
                  SKU: {adjustStockItem.sku} · Currently: <strong>{adjustStockItem.quantity} {adjustStockItem.unit}</strong>
                </div>
              </div>

              {/* Add vs Subtract Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Adjustment Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustDirection('add')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                      adjustDirection === 'add'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Inward (+ Stock)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustDirection('subtract')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                      adjustDirection === 'subtract'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <MinusCircle className="w-4 h-4" />
                    <span>Outward (- Stock)</span>
                  </button>
                </div>
              </div>

              {/* Delta Quantity */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity ({adjustStockItem.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono text-base font-bold"
                />
              </div>

              {/* Reason / Audit Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Adjustment *
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Supplier shipment inward receipt">Supplier shipment inward receipt</option>
                  <option value="Consumed in manufacturing line">Consumed in manufacturing line</option>
                  <option value="Damaged or rejected during inspection">Damaged or rejected during inspection</option>
                  <option value="Physical stocktaking discrepancy correction">Physical stock audit correction</option>
                  <option value="Internal plant transfer">Internal plant transfer</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustStockItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Apply Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deletingItem)}
        title="Delete Inventory Material"
        message={`Are you sure you want to permanently delete "${deletingItem?.name}" (${deletingItem?.sku})? This will update plant valuation and dashboard calculations.`}
        confirmText="Yes, Delete Material"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingItem(null)}
      />
    </div>
  );
};
