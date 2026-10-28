import React, { useState, useMemo } from 'react';
import { useIndustrial } from '../context/IndustrialContext';
import { Employee, Department, Shift, EmployeeStatus } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { exportEmployeesToCsv } from '../utils/exportCsv';
import {
  Users,
  Search,
  Plus,
  Download,
  Edit2,
  Trash2,
  Eye,
  Phone,
  Mail,
  X,
} from 'lucide-react';

const DEPARTMENTS: Department[] = [
  'Production',
  'Quality Control',
  'Maintenance',
  'Logistics & Warehouse',
  'Safety & Operations',
  'Plant Administration',
  'Research & Design',
];

const SHIFTS: Shift[] = [
  'Morning (06:00 - 14:00)',
  'Evening (14:00 - 22:00)',
  'Night (22:00 - 06:00)',
];

const STATUSES: EmployeeStatus[] = ['Active', 'On Leave', 'Inactive'];

export const EmployeesView: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee, settings } = useIndustrial();

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    empId: '',
    fullName: '',
    department: 'Production' as Department,
    jobRole: '',
    phone: '',
    email: '',
    shift: 'Morning (06:00 - 14:00)' as Shift,
    status: 'Active' as EmployeeStatus,
    joiningDate: new Date().toISOString().split('T')[0],
    salary: 50000,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        emp.fullName.toLowerCase().includes(q) ||
        emp.empId.toLowerCase().includes(q) ||
        emp.jobRole.toLowerCase().includes(q) ||
        emp.phone.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q);

      const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;
      const matchesStatus = selectedStatus === 'ALL' || emp.status === selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, searchQuery, selectedDept, selectedStatus]);

  // Open modal for Create
  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    const nextNum = employees.length + 1001;
    setFormData({
      empId: `EMP-${nextNum}`,
      fullName: '',
      department: 'Production',
      jobRole: '',
      phone: '',
      email: '',
      shift: 'Morning (06:00 - 14:00)',
      status: 'Active',
      joiningDate: new Date().toISOString().split('T')[0],
      salary: 52000,
    });
    setFormErrors({});
    setIsAddEditModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      empId: emp.empId,
      fullName: emp.fullName,
      department: emp.department,
      jobRole: emp.jobRole,
      phone: emp.phone,
      email: emp.email,
      shift: emp.shift,
      status: emp.status,
      joiningDate: emp.joiningDate,
      salary: emp.salary,
    });
    setFormErrors({});
    setIsAddEditModalOpen(true);
  };

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.empId.trim()) errors.empId = 'Employee ID is required';
    if (!formData.fullName.trim()) errors.fullName = 'Full Name is required';
    if (!formData.jobRole.trim()) errors.jobRole = 'Job Role / Designation is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.email.trim() || !formData.email.includes('@')) errors.email = 'Valid email is required';
    if (!formData.salary || formData.salary <= 0) errors.salary = 'Please enter a valid salary';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, formData);
    } else {
      addEmployee(formData);
    }
    setIsAddEditModalOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deletingEmployee) {
      deleteEmployee(deletingEmployee.id);
      setDeletingEmployee(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Header & Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, department, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
          />
        </div>

        {/* Filters and CTA */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {/* CSV Export */}
          <button
            type="button"
            onClick={() => exportEmployeesToCsv(filteredEmployees)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Add Employee Button */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Employees Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Workforce Roster ({filteredEmployees.length} of {employees.length})
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

        {filteredEmployees.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">No employees found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              No personnel match your current search query or department filter.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Employee</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Emp ID</th>
                  <th className="py-3 px-4">Full Name & Contact</th>
                  <th className="py-3 px-4">Department & Role</th>
                  <th className="py-3 px-4">Shift</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      {emp.empId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{emp.fullName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {emp.phone}
                        </span>
                        <span className="flex items-center gap-1 hidden sm:inline-flex">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {emp.email}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{emp.jobRole}</div>
                      <div className="text-[11px] text-slate-500">{emp.department}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      <div className="line-clamp-1">{emp.shift.split('(')[0]}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {emp.shift.includes('(') ? emp.shift.split('(')[1].replace(')', '') : ''}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          emp.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : emp.status === 'On Leave'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingEmployee(emp)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(emp)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          title="Edit Employee"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingEmployee(emp)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Employee"
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

      {/* Add / Edit Employee Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {editingEmployee ? `Edit Employee (${editingEmployee.empId})` : 'Register New Industrial Employee'}
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
                {/* Employee ID */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.empId}
                    onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                    className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono ${
                      formErrors.empId ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder="e.g. EMP-1045"
                  />
                  {formErrors.empId && (
                    <p className="text-[10px] text-red-600 mt-1">{formErrors.empId}</p>
                  )}
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      formErrors.fullName ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder="e.g. Anand R. Kulkarni"
                  />
                  {formErrors.fullName && (
                    <p className="text-[10px] text-red-600 mt-1">{formErrors.fullName}</p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Job Role */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Job Role / Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.jobRole}
                    onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                    className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      formErrors.jobRole ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder="e.g. CNC Machine Specialist"
                  />
                  {formErrors.jobRole && (
                    <p className="text-[10px] text-red-600 mt-1">{formErrors.jobRole}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      formErrors.phone ? 'border-red-500 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder="e.g. +91 98450 12345"
                  />
                  {formErrors.phone && (
                    <p className="text-[10px] text-red-600 mt-1">{formErrors.phone}</p>
                  )}
                </div>

                {/* Email Address */}
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
                    placeholder="e.g. anand.k@apexindustrial.com"
                  />
                  {formErrors.email && (
                    <p className="text-[10px] text-red-600 mt-1">{formErrors.email}</p>
                  )}
                </div>

                {/* Assigned Shift */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Shift *
                  </label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value as Shift })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {SHIFTS.map((shift) => (
                      <option key={shift} value={shift}>
                        {shift}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Employment Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Employment Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as EmployeeStatus })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Joining Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Monthly Salary */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Remuneration ({settings.currency})
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
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
                  {editingEmployee ? 'Update Employee' : 'Save & Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Employee Details Drawer / Modal */}
      {viewingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-6 relative">
              <button
                onClick={() => setViewingEmployee(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-inner font-mono">
                  {viewingEmployee.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <span className="text-[11px] font-mono font-medium text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">
                    {viewingEmployee.empId}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">
                    {viewingEmployee.fullName}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {viewingEmployee.jobRole} · {viewingEmployee.department}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 font-medium mb-1">Shift Schedule</div>
                  <div className="font-semibold text-slate-800">{viewingEmployee.shift}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 font-medium mb-1">Status</div>
                  <div className="font-semibold text-emerald-600">{viewingEmployee.status}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 font-medium mb-1">Phone Contact</div>
                  <div className="font-mono text-slate-800">{viewingEmployee.phone}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 font-medium mb-1">Official Email</div>
                  <div className="font-mono text-slate-800 truncate">{viewingEmployee.email}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 font-medium mb-1">Date Joined</div>
                  <div className="font-mono text-slate-800">{viewingEmployee.joiningDate}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 font-medium mb-1">Monthly Salary</div>
                  <div className="font-mono font-semibold text-slate-800">
                    {settings.currency}{viewingEmployee.salary.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const emp = viewingEmployee;
                    setViewingEmployee(null);
                    handleOpenEditModal(emp);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Record</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingEmployee(null)}
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
        isOpen={Boolean(deletingEmployee)}
        title="Delete Employee Record"
        message={`Are you sure you want to delete ${deletingEmployee?.fullName} (${deletingEmployee?.empId})? This will remove all their records from the local industrial registry.`}
        confirmText="Yes, Delete Record"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingEmployee(null)}
      />
    </div>
  );
};
