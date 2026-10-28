import { Employee, InventoryItem, ProductionRecord, Supplier } from '../types';

/**
 * Escapes CSV field value to ensure commas, quotes, and newlines don't corrupt the file.
 */
function escapeCsvValue(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

function triggerDownload(content: string, filename: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportEmployeesToCsv(employees: Employee[], filename = 'employees_export.csv') {
  const headers = ['Employee ID', 'Full Name', 'Department', 'Job Role', 'Phone', 'Email', 'Shift', 'Status', 'Joining Date', 'Salary'];
  const rows = employees.map(e => [
    escapeCsvValue(e.empId),
    escapeCsvValue(e.fullName),
    escapeCsvValue(e.department),
    escapeCsvValue(e.jobRole),
    escapeCsvValue(e.phone),
    escapeCsvValue(e.email),
    escapeCsvValue(e.shift),
    escapeCsvValue(e.status),
    escapeCsvValue(e.joiningDate),
    escapeCsvValue(e.salary),
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');
  triggerDownload(csvContent, filename);
}

export function exportInventoryToCsv(inventory: InventoryItem[], currency = '₹', filename = 'inventory_export.csv') {
  const headers = ['SKU', 'Material / Product Name', 'Category', 'Quantity', 'Unit', `Unit Cost (${currency})`, `Total Valuation (${currency})`, 'Min Reorder Level', 'Stock Health', 'Storage Location', 'Primary Supplier', 'Last Updated'];
  const rows = inventory.map(item => {
    const valuation = item.quantity * item.unitPrice;
    const health = item.quantity <= 0 ? 'Out of Stock' : (item.quantity <= item.minReorderLevel ? 'Low Stock' : 'Optimal');
    return [
      escapeCsvValue(item.sku),
      escapeCsvValue(item.name),
      escapeCsvValue(item.category),
      escapeCsvValue(item.quantity),
      escapeCsvValue(item.unit),
      escapeCsvValue(item.unitPrice),
      escapeCsvValue(valuation),
      escapeCsvValue(item.minReorderLevel),
      escapeCsvValue(health),
      escapeCsvValue(item.location),
      escapeCsvValue(item.supplierName),
      escapeCsvValue(item.lastUpdated),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  triggerDownload(csvContent, filename);
}

export function exportProductionToCsv(production: ProductionRecord[], filename = 'production_batches_export.csv') {
  const headers = ['Batch ID', 'Product Name', 'Production Line', 'Planned Qty', 'Completed Qty', 'Progress %', 'Unit', 'Start Date', 'Target Date', 'Status', 'Supervisor', 'Shift', 'Defects'];
  const rows = production.map(p => {
    const progress = p.plannedQuantity > 0 ? Math.round((p.completedQuantity / p.plannedQuantity) * 100) : 0;
    return [
      escapeCsvValue(p.batchId),
      escapeCsvValue(p.productName),
      escapeCsvValue(p.line),
      escapeCsvValue(p.plannedQuantity),
      escapeCsvValue(p.completedQuantity),
      escapeCsvValue(`${progress}%`),
      escapeCsvValue(p.unit),
      escapeCsvValue(p.startDate),
      escapeCsvValue(p.targetDate),
      escapeCsvValue(p.status),
      escapeCsvValue(p.supervisor),
      escapeCsvValue(p.shift),
      escapeCsvValue(p.defectsCount),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  triggerDownload(csvContent, filename);
}

export function exportSuppliersToCsv(suppliers: Supplier[], filename = 'suppliers_export.csv') {
  const headers = ['Supplier Code', 'Contact Person', 'Company Name', 'Goods Category', 'Phone Number', 'Email', 'Address', 'Lead Time (Days)', 'Rating (1-5)', 'Status'];
  const rows = suppliers.map(s => [
    escapeCsvValue(s.supplierCode),
    escapeCsvValue(s.name),
    escapeCsvValue(s.companyName),
    escapeCsvValue(s.category),
    escapeCsvValue(s.phone),
    escapeCsvValue(s.email),
    escapeCsvValue(s.address),
    escapeCsvValue(s.leadTimeDays),
    escapeCsvValue(s.rating),
    escapeCsvValue(s.status),
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');
  triggerDownload(csvContent, filename);
}
