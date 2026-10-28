export type Department = 
  | 'Production'
  | 'Quality Control'
  | 'Maintenance'
  | 'Logistics & Warehouse'
  | 'Safety & Operations'
  | 'Plant Administration'
  | 'Research & Design';

export type Shift = 'Morning (06:00 - 14:00)' | 'Evening (14:00 - 22:00)' | 'Night (22:00 - 06:00)';

export type EmployeeStatus = 'Active' | 'On Leave' | 'Inactive';

export interface Employee {
  id: string;
  empId: string; // e.g., EMP-1042
  fullName: string;
  department: Department;
  jobRole: string;
  phone: string;
  email: string;
  shift: Shift;
  status: EmployeeStatus;
  joiningDate: string;
  salary: number;
}

export type InventoryCategory = 
  | 'Raw Metals & Alloys'
  | 'Chemicals & Polymers'
  | 'Mechanical Components'
  | 'Electrical & Sensors'
  | 'Packaging & Supplies'
  | 'Finished Goods';

export type InventoryUnit = 'kg' | 'Tonnes' | 'Liters' | 'Units' | 'Meters' | 'Boxes' | 'Rolls';

export interface InventoryItem {
  id: string;
  sku: string; // e.g., SKU-RAW-001
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: InventoryUnit;
  unitPrice: number;
  minReorderLevel: number;
  location: string; // e.g., Rack A-12, Bay 3
  supplierName: string;
  lastUpdated: string;
  notes?: string;
}

export type ProductionStatus = 'Planned' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';

export interface ProductionRecord {
  id: string;
  batchId: string; // e.g., BATCH-2026-081
  productName: string;
  line: string; // e.g., Assembly Line 1, CNC Bay, Chemical Plant
  plannedQuantity: number;
  completedQuantity: number;
  unit: InventoryUnit;
  startDate: string;
  targetDate: string;
  status: ProductionStatus;
  supervisor: string;
  shift: Shift;
  defectsCount: number;
  notes?: string;
}

export type SupplierStatus = 'Active' | 'Preferred' | 'Under Review' | 'Inactive';

export interface Supplier {
  id: string;
  supplierCode: string; // e.g., SUP-101
  name: string;
  companyName: string;
  category: string;
  phone: string;
  email: string;
  address: string;
  leadTimeDays: number;
  rating: number; // 1 to 5
  status: SupplierStatus;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  module: 'Employee' | 'Inventory' | 'Production' | 'Supplier' | 'System';
  action: 'Created' | 'Updated' | 'Deleted' | 'Stock Adjusted' | 'Status Changed';
  description: string;
  user: string;
}

export interface PlantSettings {
  plantName: string;
  plantCode: string;
  location: string;
  currency: string; // '$', '₹', '€', '£'
  defaultLowStockThreshold: number;
  managerName: string;
  emergencyContact: string;
}

export type NavigationTab = 
  | 'dashboard'
  | 'employees'
  | 'inventory'
  | 'production'
  | 'suppliers'
  | 'reports'
  | 'settings';
