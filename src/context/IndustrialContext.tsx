import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Employee,
  InventoryItem,
  ProductionRecord,
  Supplier,
  ActivityLog,
  PlantSettings,
  NavigationTab,
  ProductionStatus,
} from '../types';
import {
  INITIAL_EMPLOYEES,
  INITIAL_INVENTORY,
  INITIAL_PRODUCTION,
  INITIAL_SUPPLIERS,
  INITIAL_ACTIVITIES,
  INITIAL_SETTINGS,
} from '../data/sampleData';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: number;
}

interface IndustrialContextType {
  // Navigation
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;

  // Data collections
  employees: Employee[];
  inventory: InventoryItem[];
  production: ProductionRecord[];
  suppliers: Supplier[];
  activities: ActivityLog[];
  settings: PlantSettings;

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;

  // Employee CRUD
  addEmployee: (employee: Omit<Employee, 'id'>) => boolean;
  updateEmployee: (id: string, updates: Partial<Employee>) => boolean;
  deleteEmployee: (id: string) => boolean;

  // Inventory CRUD
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => boolean;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => boolean;
  deleteInventoryItem: (id: string) => boolean;
  adjustStock: (id: string, delta: number, reason: string) => boolean;

  // Production CRUD
  addProductionRecord: (record: Omit<ProductionRecord, 'id'>) => boolean;
  updateProductionRecord: (id: string, updates: Partial<ProductionRecord>) => boolean;
  deleteProductionRecord: (id: string) => boolean;
  advanceProductionStatus: (id: string, newStatus: ProductionStatus) => boolean;

  // Supplier CRUD
  addSupplier: (supplier: Omit<Supplier, 'id'>) => boolean;
  updateSupplier: (id: string, updates: Partial<Supplier>) => boolean;
  deleteSupplier: (id: string) => boolean;

  // System & Settings
  updateSettings: (updates: Partial<PlantSettings>) => void;
  resetToSampleData: () => void;
  clearAllData: () => void;
  exportBackupJson: () => void;
  importBackupJson: (jsonString: string) => boolean;

  // Computed metrics
  stats: {
    totalEmployees: number;
    activeEmployees: number;
    totalInventoryItems: number;
    totalInventoryValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalProductionBatches: number;
    inProgressBatchesCount: number;
    completedBatchesCount: number;
    totalPlannedUnits: number;
    totalCompletedUnits: number;
    totalSuppliers: number;
    activeSuppliersCount: number;
    lowStockItems: InventoryItem[];
  };
}

const STORAGE_KEY = 'ims_industrial_data_v1';

const IndustrialContext = createContext<IndustrialContextType | undefined>(undefined);

export const IndustrialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // State initialization from localStorage or defaults
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_employees`);
      return stored ? JSON.parse(stored) : INITIAL_EMPLOYEES;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_inventory`);
      return stored ? JSON.parse(stored) : INITIAL_INVENTORY;
    } catch {
      return INITIAL_INVENTORY;
    }
  });

  const [production, setProduction] = useState<ProductionRecord[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_production`);
      return stored ? JSON.parse(stored) : INITIAL_PRODUCTION;
    } catch {
      return INITIAL_PRODUCTION;
    }
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_suppliers`);
      return stored ? JSON.parse(stored) : INITIAL_SUPPLIERS;
    } catch {
      return INITIAL_SUPPLIERS;
    }
  });

  const [activities, setActivities] = useState<ActivityLog[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_activities`);
      return stored ? JSON.parse(stored) : INITIAL_ACTIVITIES;
    } catch {
      return INITIAL_ACTIVITIES;
    }
  });

  const [settings, setSettings] = useState<PlantSettings>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_settings`);
      return stored ? JSON.parse(stored) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_employees`, JSON.stringify(employees));
    } catch (e) {
      console.error('Failed to sync employees to localStorage', e);
    }
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_inventory`, JSON.stringify(inventory));
    } catch (e) {
      console.error('Failed to sync inventory to localStorage', e);
    }
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_production`, JSON.stringify(production));
    } catch (e) {
      console.error('Failed to sync production to localStorage', e);
    }
  }, [production]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_suppliers`, JSON.stringify(suppliers));
    } catch (e) {
      console.error('Failed to sync suppliers to localStorage', e);
    }
  }, [suppliers]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_activities`, JSON.stringify(activities));
    } catch (e) {
      console.error('Failed to sync activities to localStorage', e);
    }
  }, [activities]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to sync settings to localStorage', e);
    }
  }, [settings]);

  // Toast notifier helper
  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { id, message, type, timestamp: Date.now() };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const logActivity = (
    module: ActivityLog['module'],
    action: ActivityLog['action'],
    description: string,
    user = 'Plant Manager'
  ) => {
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: formatted,
      module,
      action,
      description,
      user,
    };
    setActivities((prev) => [newLog, ...prev.slice(0, 49)]); // keep latest 50
  };

  // ---------------- EMPLOYEES CRUD ----------------
  const addEmployee = (empData: Omit<Employee, 'id'>): boolean => {
    const newId = `emp-${Date.now()}`;
    const newEmp: Employee = { ...empData, id: newId };
    setEmployees((prev) => [newEmp, ...prev]);
    logActivity('Employee', 'Created', `Registered ${newEmp.fullName} (${newEmp.empId}) as ${newEmp.jobRole}.`);
    showToast(`Employee "${newEmp.fullName}" successfully added.`, 'success');
    return true;
  };

  const updateEmployee = (id: string, updates: Partial<Employee>): boolean => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, ...updates } : emp))
    );
    const target = employees.find((e) => e.id === id);
    logActivity('Employee', 'Updated', `Updated record for ${target?.fullName || id} (${target?.empId}).`);
    showToast(`Employee record updated successfully.`, 'success');
    return true;
  };

  const deleteEmployee = (id: string): boolean => {
    const target = employees.find((e) => e.id === id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    logActivity('Employee', 'Deleted', `Deleted employee record ${target?.fullName || id} (${target?.empId}).`);
    showToast(`Employee record deleted.`, 'info');
    return true;
  };

  // ---------------- INVENTORY CRUD ----------------
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'lastUpdated'>): boolean => {
    const newId = `inv-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const newItem: InventoryItem = { ...itemData, id: newId, lastUpdated: today };
    setInventory((prev) => [newItem, ...prev]);
    logActivity('Inventory', 'Created', `Added inventory item ${newItem.name} (${newItem.sku}).`);
    showToast(`Material "${newItem.name}" added to inventory.`, 'success');
    return true;
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>): boolean => {
    const today = new Date().toISOString().split('T')[0];
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, lastUpdated: today } : item))
    );
    const target = inventory.find((i) => i.id === id);
    logActivity('Inventory', 'Updated', `Updated specifications for ${target?.name || id} (${target?.sku}).`);
    showToast(`Inventory item updated.`, 'success');
    return true;
  };

  const deleteInventoryItem = (id: string): boolean => {
    const target = inventory.find((i) => i.id === id);
    setInventory((prev) => prev.filter((i) => i.id !== id));
    logActivity('Inventory', 'Deleted', `Removed ${target?.name || id} (${target?.sku}) from warehouse.`);
    showToast(`Inventory item deleted.`, 'info');
    return true;
  };

  const adjustStock = (id: string, delta: number, reason: string): boolean => {
    const target = inventory.find((i) => i.id === id);
    if (!target) return false;

    const newQty = Math.max(0, target.quantity + delta);
    const today = new Date().toISOString().split('T')[0];

    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty, lastUpdated: today } : item))
    );

    const sign = delta >= 0 ? `+${delta}` : `${delta}`;
    logActivity(
      'Inventory',
      'Stock Adjusted',
      `Adjusted stock for ${target.name} by ${sign} ${target.unit} (${reason}). New Qty: ${newQty} ${target.unit}.`
    );

    if (newQty <= target.minReorderLevel) {
      showToast(`Warning: ${target.name} stock (${newQty} ${target.unit}) is now below minimum reorder level!`, 'warning');
    } else {
      showToast(`Stock updated: ${sign} ${target.unit} (${reason})`, 'success');
    }

    return true;
  };

  // ---------------- PRODUCTION CRUD ----------------
  const addProductionRecord = (recordData: Omit<ProductionRecord, 'id'>): boolean => {
    const newId = `prod-${Date.now()}`;
    const newRecord: ProductionRecord = { ...recordData, id: newId };
    setProduction((prev) => [newRecord, ...prev]);
    logActivity('Production', 'Created', `Scheduled production batch ${newRecord.batchId} (${newRecord.productName}).`);
    showToast(`Production Batch ${newRecord.batchId} scheduled.`, 'success');
    return true;
  };

  const updateProductionRecord = (id: string, updates: Partial<ProductionRecord>): boolean => {
    setProduction((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, ...updates } : rec))
    );
    const target = production.find((p) => p.id === id);
    logActivity('Production', 'Updated', `Updated batch parameters for ${target?.batchId || id}.`);
    showToast(`Production batch updated.`, 'success');
    return true;
  };

  const deleteProductionRecord = (id: string): boolean => {
    const target = production.find((p) => p.id === id);
    setProduction((prev) => prev.filter((p) => p.id !== id));
    logActivity('Production', 'Deleted', `Deleted batch record ${target?.batchId || id}.`);
    showToast(`Production batch record removed.`, 'info');
    return true;
  };

  const advanceProductionStatus = (id: string, newStatus: ProductionStatus): boolean => {
    const target = production.find((p) => p.id === id);
    if (!target) return false;

    let updatedCompleted = target.completedQuantity;
    // If marked Completed, auto-fill completed quantity to planned if it was lower
    if (newStatus === 'Completed' && target.completedQuantity < target.plannedQuantity) {
      updatedCompleted = target.plannedQuantity;
    }

    setProduction((prev) =>
      prev.map((rec) =>
        rec.id === id
          ? { ...rec, status: newStatus, completedQuantity: updatedCompleted }
          : rec
      )
    );

    logActivity(
      'Production',
      'Status Changed',
      `Batch ${target.batchId} status transitioned from "${target.status}" to "${newStatus}".`
    );
    showToast(`Batch ${target.batchId} moved to ${newStatus}.`, 'success');
    return true;
  };

  // ---------------- SUPPLIER CRUD ----------------
  const addSupplier = (supData: Omit<Supplier, 'id'>): boolean => {
    const newId = `sup-${Date.now()}`;
    const newSup: Supplier = { ...supData, id: newId };
    setSuppliers((prev) => [newSup, ...prev]);
    logActivity('Supplier', 'Created', `Registered vendor ${newSup.companyName} (${newSup.supplierCode}).`);
    showToast(`Supplier "${newSup.companyName}" registered.`, 'success');
    return true;
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>): boolean => {
    setSuppliers((prev) =>
      prev.map((sup) => (sup.id === id ? { ...sup, ...updates } : sup))
    );
    const target = suppliers.find((s) => s.id === id);
    logActivity('Supplier', 'Updated', `Updated vendor record for ${target?.companyName || id}.`);
    showToast(`Supplier record updated.`, 'success');
    return true;
  };

  const deleteSupplier = (id: string): boolean => {
    const target = suppliers.find((s) => s.id === id);
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    logActivity('Supplier', 'Deleted', `Removed supplier ${target?.companyName || id}.`);
    showToast(`Supplier removed from registry.`, 'info');
    return true;
  };

  // ---------------- SETTINGS & RESET ----------------
  const updateSettings = (updates: Partial<PlantSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    logActivity('System', 'Updated', `Updated plant configuration settings.`);
    showToast(`System settings saved successfully.`, 'success');
  };

  const resetToSampleData = () => {
    setEmployees(INITIAL_EMPLOYEES);
    setInventory(INITIAL_INVENTORY);
    setProduction(INITIAL_PRODUCTION);
    setSuppliers(INITIAL_SUPPLIERS);
    setActivities(INITIAL_ACTIVITIES);
    setSettings(INITIAL_SETTINGS);

    localStorage.setItem(`${STORAGE_KEY}_employees`, JSON.stringify(INITIAL_EMPLOYEES));
    localStorage.setItem(`${STORAGE_KEY}_inventory`, JSON.stringify(INITIAL_INVENTORY));
    localStorage.setItem(`${STORAGE_KEY}_production`, JSON.stringify(INITIAL_PRODUCTION));
    localStorage.setItem(`${STORAGE_KEY}_suppliers`, JSON.stringify(INITIAL_SUPPLIERS));
    localStorage.setItem(`${STORAGE_KEY}_activities`, JSON.stringify(INITIAL_ACTIVITIES));
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(INITIAL_SETTINGS));

    logActivity('System', 'Updated', `Restored factory defaults and realistic sample dataset.`);
    showToast(`Reset to factory sample data complete!`, 'success');
  };

  const clearAllData = () => {
    setEmployees([]);
    setInventory([]);
    setProduction([]);
    setSuppliers([]);
    setActivities([]);
    localStorage.removeItem(`${STORAGE_KEY}_employees`);
    localStorage.removeItem(`${STORAGE_KEY}_inventory`);
    localStorage.removeItem(`${STORAGE_KEY}_production`);
    localStorage.removeItem(`${STORAGE_KEY}_suppliers`);
    localStorage.removeItem(`${STORAGE_KEY}_activities`);

    logActivity('System', 'Deleted', `All data records cleared by administrator.`);
    showToast(`All records cleared from browser storage.`, 'warning');
  };

  const exportBackupJson = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      plant: settings,
      employees,
      inventory,
      production,
      suppliers,
      activities,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `industrial_management_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Database backup downloaded successfully.`, 'success');
  };

  const importBackupJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.employees && Array.isArray(parsed.employees)) setEmployees(parsed.employees);
      if (parsed.inventory && Array.isArray(parsed.inventory)) setInventory(parsed.inventory);
      if (parsed.production && Array.isArray(parsed.production)) setProduction(parsed.production);
      if (parsed.suppliers && Array.isArray(parsed.suppliers)) setSuppliers(parsed.suppliers);
      if (parsed.settings) setSettings(parsed.settings);
      if (parsed.activities && Array.isArray(parsed.activities)) setActivities(parsed.activities);

      logActivity('System', 'Updated', `Imported database records from JSON backup.`);
      showToast(`Database backup restored successfully!`, 'success');
      return true;
    } catch {
      showToast(`Invalid backup file format.`, 'error');
      return false;
    }
  };

  // ---------------- COMPUTED METRICS ----------------
  const stats = useMemo(() => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter((e) => e.status === 'Active').length;

    const totalInventoryItems = inventory.length;
    const totalInventoryValue = inventory.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    const lowStockItems = inventory.filter((item) => item.quantity <= item.minReorderLevel);
    const lowStockCount = lowStockItems.length;
    const outOfStockCount = inventory.filter((item) => item.quantity <= 0).length;

    const totalProductionBatches = production.length;
    const inProgressBatchesCount = production.filter((p) => p.status === 'In Progress').length;
    const completedBatchesCount = production.filter((p) => p.status === 'Completed').length;
    const totalPlannedUnits = production.reduce((sum, p) => sum + p.plannedQuantity, 0);
    const totalCompletedUnits = production.reduce((sum, p) => sum + p.completedQuantity, 0);

    const totalSuppliers = suppliers.length;
    const activeSuppliersCount = suppliers.filter(
      (s) => s.status === 'Active' || s.status === 'Preferred'
    ).length;

    return {
      totalEmployees,
      activeEmployees,
      totalInventoryItems,
      totalInventoryValue,
      lowStockCount,
      outOfStockCount,
      totalProductionBatches,
      inProgressBatchesCount,
      completedBatchesCount,
      totalPlannedUnits,
      totalCompletedUnits,
      totalSuppliers,
      activeSuppliersCount,
      lowStockItems,
    };
  }, [employees, inventory, production, suppliers]);

  return (
    <IndustrialContext.Provider
      value={{
        activeTab,
        setActiveTab,
        employees,
        inventory,
        production,
        suppliers,
        activities,
        settings,
        toasts,
        showToast,
        dismissToast,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        adjustStock,
        addProductionRecord,
        updateProductionRecord,
        deleteProductionRecord,
        advanceProductionStatus,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        updateSettings,
        resetToSampleData,
        clearAllData,
        exportBackupJson,
        importBackupJson,
        stats,
      }}
    >
      {children}
    </IndustrialContext.Provider>
  );
};

export const useIndustrial = (): IndustrialContextType => {
  const context = useContext(IndustrialContext);
  if (!context) {
    throw new Error('useIndustrial must be used within an IndustrialProvider');
  }
  return context;
};
