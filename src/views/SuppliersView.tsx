import React, { useState, useMemo } from 'react';
import { useIndustrial } from '../context/IndustrialContext';
import { Supplier, SupplierStatus } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { exportSuppliersToCsv } from '../utils/exportCsv';
import {
  Truck,
  Search,
  Plus,
  Download,
  Edit2,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Star,
  Clock,
  X,
  Building,
  CheckCircle,
} from 'lucide-react';

const SUPPLIER_STATUSES: SupplierStatus[] = ['Active', 'Preferred', 'Under Review', 'Inactive'];

export const SuppliersView: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, inventory } = useIndustrial();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    supplierCode: '',
    name: '',
    companyName: '',
    category: '',
    phone: '',
    email: '',
    address: '',
    leadTimeDays: 3,
    rating: 4,
    status: 'Active' as SupplierStatus,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filtered suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((sup) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        sup.name.toLowerCase().includes(q) ||
        sup.companyName.toLowerCase().includes(q) ||
        sup.supplierCode.toLowerCase().includes(q) ||
        sup.category.toLowerCase().includes(q) ||
        sup.address.toLowerCase().includes(q) ||
        sup.phone.toLowerCase().includes(q);

      const matchesStatus = selectedStatus === 'ALL' || sup.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [suppliers, searchQuery, selectedStatus]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    const nextCode = String(suppliers.length + 107).padStart(3, '0');
    setFormData({
      supplierCode: `SUP-${nextCode}`,
      name: '',
      companyName: '',
      category: 'Raw Metals & Fasteners',
      phone: '',
      email: '',
      address: '',
      leadTimeDays: 4,
      rating: 4,
      status: 'Active',
    });
    setFormErrors({});
    setIsAddEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (sup: Supplier) => {
    setEditingSupplier(sup);
    setFormData({
      supplierCode: sup.supplierCode,
      name: sup.name,
      companyName: sup.companyName,
      category: sup.category,
      phone: sup.phone,
      email: sup.email,
      address: sup.address,
      leadTimeDays: sup.leadTimeDays,
      rating: sup.rating,
      status: sup.status,
    });
    setFormErrors({});
    setIsAddEditModalOpen(true);
  };

  // Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.supplierCode.trim()) errors.supplierCode = 'Supplier code is required';
    if (!formData.name.trim()) errors.name = 'Contact person name is required';
    if (!formData.companyName.trim()) errors.companyName = 'Company name is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.email.trim() || !formData.email.includes('@')) errors.email = 'Valid email is required';
    if (!formData.address.trim()) errors.address = 'Physical address is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, formData);
    } else {
      addSupplier(formData);
    }
    setIsAddEditModalOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deletingSupplier) {
      deleteSupplier(deletingSupplier.id);
      setDeletingSupplier(null);
    }
  };

  // Find linked materials for a viewing supplier
  const linkedItems = useMemo(() => {
    if (!viewingSupplier) return [];
    return inventory.filter(
      (item) =>
        item.supplierName.toLowerCase().includes(viewingSupplier.companyName.toLowerCase()) ||
        viewingSupplier.companyName.toLowerCase().includes(item.supplierName.toLowerCase())
    );
  }, [viewingSupplier, inventory]);

  return (
    <div className="space-y-6">
      {/* Control Header & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search supplier by company, contact, category, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
          />
        </div>

        {/* Filters and CTA */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Partner Statuses</option>
            {SUPPLIER_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* Export CSV */}
          <button
            type="button"
            onClick={() => exportSuppliersToCsv(filteredSuppliers)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            title="Download CSV Supplier Directory"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Add Supplier Button */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Supplier Grid / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Authorized Vendor Directory ({filteredSuppliers.length} partners)
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

        {filteredSuppliers.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">No suppliers found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              No vendors match your search criteria.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Supplier</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Company & Category</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Phone & Email</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-center">Lead Time</th>
                  <th className="py-3 px-4 text-center">Rating</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSuppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      {sup.supplierCode}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{sup.companyName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{sup.category}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-800 font-medium">
                      {sup.name}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-800 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{sup.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{sup.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-[180px] truncate" title={sup.address}>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{sup.address}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap font-mono text-slate-700">
                      {sup.leadTimeDays} days
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-0.5 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < sup.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          sup.status === 'Preferred'
                            ? 'bg-blue-100 text-blue-800'
                            : sup.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sup.status === 'Under Review'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {sup.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingSupplier(sup)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="View Details & Supplied SKUs"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(sup)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          title="Edit Supplier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingSupplier(sup)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Supplier"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Supplier Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {editingSupplier ? `Edit Supplier Profile (${editingSupplier.supplierCode})` : 'Register Industrial Supplier'}
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
                {/* Code */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supplier Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.supplierCode}
                    onChange={(e) => setFormData({ ...formData, supplierCode: e.target.value })}
                    className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono ${
                      formErrors.supplierCode ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder="e.g. SUP-108"
                  />
                  {formErrors.supplierCode && (
                    <p className="text-[10px] text-red-600 mt-1">{formErrors.supplierCode}</p>
                  )}
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      formErrors.companyName ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder="e.g. Jindal Steel & Power Ltd"
                  />
                  {formErrors.companyName && (
                    <p className="text-[10px] text-red-600 mt-1">{formErrors.companyName}</p>
                  )}
                </div>

                {/* Contact Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      formErrors.name ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder="e.g. Manoj K. Mittal"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supply Category / Materials *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. High Alloy Billets & Ingots"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono ${
                      formErrors.phone ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder="e.g. +91 22 2840 5000"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      formErrors.email ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder="e.g. sales@jindalsteel.in"
                  />
                </div>

                {/* Lead Time */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Average Delivery Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.leadTimeDays}
                    onChange={(e) => setFormData({ ...formData, leadTimeDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reliability Rating (1 - 5 Stars)
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="5">★★★★★ (5 Stars - Excellent)</option>
                    <option value="4">★★★★☆ (4 Stars - High Reliability)</option>
                    <option value="3">★★★☆☆ (3 Stars - Average)</option>
                    <option value="2">★★☆☆☆ (2 Stars - Low)</option>
                    <option value="1">★☆☆☆☆ (1 Star - Critical Delays)</option>
                  </select>
                </div>

                {/* Status */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Partner Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as SupplierStatus })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {SUPPLIER_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Physical Warehouse / Plant Address *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Plot 18-A, Industrial Estate, Hubli, Karnataka"
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
                  {editingSupplier ? 'Update Supplier' : 'Register Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Supplier Details Modal */}
      {viewingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-6 relative">
              <button
                onClick={() => setViewingSupplier(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-inner">
                  <Building className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[11px] font-mono font-medium text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">
                    {viewingSupplier.supplierCode}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">
                    {viewingSupplier.companyName}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Contact: {viewingSupplier.name} · {viewingSupplier.category}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 font-medium mb-1">Phone</div>
                  <div className="font-mono text-slate-800 font-semibold">{viewingSupplier.phone}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 font-medium mb-1">Email</div>
                  <div className="font-mono text-slate-800 truncate font-semibold">{viewingSupplier.email}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 font-medium mb-1">Avg Lead Time</div>
                  <div className="font-mono text-slate-800 font-semibold">{viewingSupplier.leadTimeDays} Days</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 font-medium mb-1">Partner Status</div>
                  <div className="text-emerald-700 font-semibold">{viewingSupplier.status}</div>
                </div>
                <div className="col-span-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 font-medium mb-1">Registered Address</div>
                  <div className="text-slate-800">{viewingSupplier.address}</div>
                </div>
              </div>

              {/* Linked Materials Section */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Materials Supplied to Plant ({linkedItems.length})
                </h4>
                {linkedItems.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    No active inventory items currently linked to this vendor name.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {linkedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100 text-xs"
                      >
                        <div>
                          <span className="font-medium text-slate-900">{item.name}</span>
                          <span className="text-slate-400 font-mono text-[10px] ml-2">{item.sku}</span>
                        </div>
                        <span className="font-mono font-semibold text-slate-700">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const sup = viewingSupplier;
                    setViewingSupplier(null);
                    handleOpenEditModal(sup);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingSupplier(null)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deletingSupplier)}
        title="Delete Supplier Profile"
        message={`Are you sure you want to delete ${deletingSupplier?.companyName} (${deletingSupplier?.supplierCode})? This will remove them from the authorized supplier directory.`}
        confirmText="Yes, Delete Supplier"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingSupplier(null)}
      />
    </div>
  );
};
