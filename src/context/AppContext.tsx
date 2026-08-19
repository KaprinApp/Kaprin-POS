import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  Product,
  SaleRecord,
  PurchaseRecord,
  IncomeRecord,
  ExpenseRecord,
  Customer,
  Supplier,
  StaffUser,
  StoreSettings,
  NavTab,
  ReportSubTab,
} from '../types';
import {
  initialProducts,
  initialSales,
  initialPurchases,
  initialIncomes,
  initialExpenses,
  initialCustomers,
  initialSuppliers,
  initialStaff,
  initialSettings,
} from '../data/mockData';
import { isSupabaseConfigured, getActiveSupabaseConfig } from '../lib/supabase';
import {
  fetchLatestCloudData,
  saveCloudData,
  subscribeToPosRealtime,
  SyncStatusType,
  FullPosData,
} from '../lib/supabaseSync';

interface AppContextType {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  reportSubTab: ReportSubTab;
  setReportSubTab: (subTab: ReportSubTab) => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  sales: SaleRecord[];
  setSales: React.Dispatch<React.SetStateAction<SaleRecord[]>>;
  purchases: PurchaseRecord[];
  setPurchases: React.Dispatch<React.SetStateAction<PurchaseRecord[]>>;
  incomes: IncomeRecord[];
  setIncomes: React.Dispatch<React.SetStateAction<IncomeRecord[]>>;
  expenses: ExpenseRecord[];
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseRecord[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  staffList: StaffUser[];
  setStaffList: React.Dispatch<React.SetStateAction<StaffUser[]>>;
  activeStaff: StaffUser;
  setActiveStaff: (staff: StaffUser) => void;
  addStaff: (staff: Omit<StaffUser, 'id'>) => void;
  updateStaff: (id: string, staff: Partial<StaffUser>) => void;
  deleteStaff: (id: string) => { success: boolean; error?: string };
  loginWithPin: (pin: string) => { success: boolean; staff?: StaffUser; error?: string };
  settings: StoreSettings;
  setSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addSaleRecord: (sale: Omit<SaleRecord, 'id'>) => void;
  addMultipleSaleRecords: (records: Omit<SaleRecord, 'id'>[]) => void;
  addPurchaseRecord: (purchase: Omit<PurchaseRecord, 'id'>, extraProductInfo?: Partial<Product>) => void;
  addIncomeRecord: (income: Omit<IncomeRecord, 'id'>) => void;
  addExpenseRecord: (expense: Omit<ExpenseRecord, 'id'>) => void;
  addCustomer: (cust: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, cust: Partial<Customer>) => void;
  addSupplier: (sup: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, sup: Partial<Supplier>) => void;
  resetAllData: () => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedStore: string;
  setSelectedStore: (store: string) => void;
  isStaffModalOpen: boolean;
  setIsStaffModalOpen: (open: boolean) => void;
  isHelpModalOpen: boolean;
  setIsHelpModalOpen: (open: boolean) => void;
  isPrintSettingsOpen: boolean;
  setIsPrintSettingsOpen: (open: boolean) => void;
  isSupabaseModalOpen: boolean;
  setIsSupabaseModalOpen: (open: boolean) => void;
  // Realtime Auto-Sync State & Methods
  syncStatus: SyncStatusType;
  isRealtimeActive: boolean;
  lastSyncedTime: string | null;
  remoteSyncNotification: string | null;
  setRemoteSyncNotification: (msg: string | null) => void;
  triggerManualSync: () => Promise<{ success: boolean; message: string }>;
  triggerManualPull: () => Promise<{ success: boolean; message: string }>;
  refreshSupabaseConnection: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<NavTab>('reports');
  const [reportSubTab, setReportSubTab] = useState<ReportSubTab>('sales_purchase');
  const [selectedDate, setSelectedDate] = useState<string>('8/14/2026');
  const [selectedStore, setSelectedStore] = useState<string>('Main Store');

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isPrintSettingsOpen, setIsPrintSettingsOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Realtime Sync Status states
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>('idle');
  const [isRealtimeActive, setIsRealtimeActive] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  const [remoteSyncNotification, setRemoteSyncNotification] = useState<string | null>(null);
  const [supabaseConfigVersion, setSupabaseConfigVersion] = useState(0);

  // Sync control refs to prevent loops and race conditions
  const isInitialMount = useRef(true);
  const isInitialFetchDone = useRef(false);
  const isRemoteUpdating = useRef(false);
  const autoSaveTimeoutRef = useRef<any>(null);

  // Storage initialization
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('pos_products');
    if (saved) {
      try {
        const parsed: Product[] = JSON.parse(saved);
        // Ensure default images are backfilled if missing
        return parsed.map((p) => {
          if (!p.imageUrl) {
            const initialMatch = initialProducts.find((ip) => ip.barcode === p.barcode);
            if (initialMatch?.imageUrl) {
              return { ...p, imageUrl: initialMatch.imageUrl };
            }
          }
          return p;
        });
      } catch (e) {
        return initialProducts;
      }
    }
    return initialProducts;
  });

  const [sales, setSales] = useState<SaleRecord[]>(() => {
    const saved = localStorage.getItem('pos_sales');
    return saved ? JSON.parse(saved) : initialSales;
  });

  const [purchases, setPurchases] = useState<PurchaseRecord[]>(() => {
    const saved = localStorage.getItem('pos_purchases');
    return saved ? JSON.parse(saved) : initialPurchases;
  });

  const [incomes, setIncomes] = useState<IncomeRecord[]>(() => {
    const saved = localStorage.getItem('pos_incomes');
    return saved ? JSON.parse(saved) : initialIncomes;
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem('pos_expenses');
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('pos_customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('pos_suppliers');
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  const [staffList, setStaffList] = useState<StaffUser[]>(() => {
    const saved = localStorage.getItem('pos_staff');
    return saved ? JSON.parse(saved) : initialStaff;
  });

  const [activeStaff, setActiveStaffState] = useState<StaffUser>(() => {
    const saved = localStorage.getItem('pos_active_staff');
    return saved ? JSON.parse(saved) : initialStaff[0];
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('pos_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  // Local storage persistence effects
  useEffect(() => {
    localStorage.setItem('pos_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('pos_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('pos_purchases', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem('pos_incomes', JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem('pos_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('pos_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('pos_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('pos_staff', JSON.stringify(staffList));
  }, [staffList]);

  useEffect(() => {
    localStorage.setItem('pos_active_staff', JSON.stringify(activeStaff));
  }, [activeStaff]);

  useEffect(() => {
    localStorage.setItem('pos_settings', JSON.stringify(settings));
  }, [settings]);

  const refreshSupabaseConnection = useCallback(() => {
    setSupabaseConfigVersion(v => v + 1);
  }, []);

  // 1. AUTO FETCH ON STARTUP & REALTIME SUBSCRIPTION
  useEffect(() => {
    const config = getActiveSupabaseConfig();
    const isConfigured = isSupabaseConfigured(config.url, config.anonKey);

    if (!isConfigured) {
      setSyncStatus('idle');
      setIsRealtimeActive(false);
      isInitialFetchDone.current = true;
      return;
    }

    let isSubscribed = true;

    const initCloudDataAndRealtime = async () => {
      setSyncStatus('fetching');
      try {
        // Auto Fetch latest POS data from Supabase
        const res = await fetchLatestCloudData();

        if (!isSubscribed) return;

        if (res.success && res.data) {
          const d = res.data;
          isRemoteUpdating.current = true;

          if (Array.isArray(d.products) && d.products.length > 0) setProducts(d.products);
          if (Array.isArray(d.sales)) setSales(d.sales);
          if (Array.isArray(d.purchases)) setPurchases(d.purchases);
          if (Array.isArray(d.incomes)) setIncomes(d.incomes);
          if (Array.isArray(d.expenses)) setExpenses(d.expenses);
          if (Array.isArray(d.customers)) setCustomers(d.customers);
          if (Array.isArray(d.suppliers)) setSuppliers(d.suppliers);
          if (Array.isArray(d.staff) && d.staff.length > 0) setStaffList(d.staff);
          if (d.settings && d.settings.shopName) setSettings(d.settings);

          setSyncStatus('synced');
          const timeStr = new Date().toLocaleTimeString('my-MM', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setLastSyncedTime(timeStr);

          setTimeout(() => {
            isRemoteUpdating.current = false;
          }, 400);
        } else if (res.success && !res.data) {
          // Empty cloud table - automatically push initial data to cloud
          const payload: FullPosData = {
            products,
            sales,
            purchases,
            incomes,
            expenses,
            customers,
            suppliers,
            staff: staffList,
            settings,
          };
          await saveCloudData(payload);
          setSyncStatus('synced');
          setLastSyncedTime(new Date().toLocaleTimeString('my-MM', { hour: '2-digit', minute: '2-digit' }));
        } else {
          setSyncStatus('idle');
        }
      } catch (err) {
        console.error('Initial auto fetch error:', err);
        setSyncStatus('error');
      } finally {
        isInitialFetchDone.current = true;
      }
    };

    initCloudDataAndRealtime();

    // 3. REALTIME SUBSCRIPTION FOR INSTANT UPDATES ACROSS DEVICES
    const unsubscribe = subscribeToPosRealtime(
      (remoteData, originId) => {
        if (!isSubscribed) return;

        // Flag as remote update so our auto-save doesn't echo it back
        isRemoteUpdating.current = true;

        if (Array.isArray(remoteData.products)) setProducts(remoteData.products);
        if (Array.isArray(remoteData.sales)) setSales(remoteData.sales);
        if (Array.isArray(remoteData.purchases)) setPurchases(remoteData.purchases);
        if (Array.isArray(remoteData.incomes)) setIncomes(remoteData.incomes);
        if (Array.isArray(remoteData.expenses)) setExpenses(remoteData.expenses);
        if (Array.isArray(remoteData.customers)) setCustomers(remoteData.customers);
        if (Array.isArray(remoteData.suppliers)) setSuppliers(remoteData.suppliers);
        if (Array.isArray(remoteData.staff) && remoteData.staff.length > 0) setStaffList(remoteData.staff);
        if (remoteData.settings && remoteData.settings.shopName) setSettings(remoteData.settings);

        setSyncStatus('synced');
        const timeStr = new Date().toLocaleTimeString('my-MM', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSyncedTime(timeStr);
        setRemoteSyncNotification(`⚡ အခြားစက် (PC/Mobile) မှ ဒေတာအသစ်များကို Realtime ရရှိပါသည် (${timeStr})`);

        setTimeout(() => {
          setRemoteSyncNotification(null);
        }, 5000);

        setTimeout(() => {
          isRemoteUpdating.current = false;
        }, 500);
      },
      (realtimeStatus) => {
        if (!isSubscribed) return;
        setIsRealtimeActive(realtimeStatus === 'CONNECTED');
      }
    );

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, [supabaseConfigVersion]);

  // 2. AUTO SAVE ON CHANGE (DEBOUNCED BACKGROUND SYNC)
  useEffect(() => {
    // Skip on initial mount before fetch completes
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!isInitialFetchDone.current) {
      return;
    }

    // Skip if change originated from incoming remote realtime update
    if (isRemoteUpdating.current) {
      return;
    }

    const config = getActiveSupabaseConfig();
    if (!isSupabaseConfigured(config.url, config.anonKey)) {
      return;
    }

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    setSyncStatus('syncing');

    // Debounce 650ms so rapid actions don't spam Supabase
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        const payload: FullPosData = {
          products,
          sales,
          purchases,
          incomes,
          expenses,
          customers,
          suppliers,
          staff: staffList,
          settings,
        };

        const res = await saveCloudData(payload);
        if (res.success) {
          setSyncStatus('synced');
          setLastSyncedTime(new Date().toLocaleTimeString('my-MM', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        } else {
          setSyncStatus('error');
        }
      } catch (err) {
        console.error('Auto save error:', err);
        setSyncStatus('error');
      }
    }, 650);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [products, sales, purchases, incomes, expenses, customers, suppliers, staffList, settings]);

  // Manual Trigger Functions
  const triggerManualSync = async (): Promise<{ success: boolean; message: string }> => {
    const config = getActiveSupabaseConfig();
    if (!isSupabaseConfigured(config.url, config.anonKey)) {
      return { success: false, message: 'Supabase URL နှင့် Anon Key ကို ထည့်သွင်းထားခြင်း မရှိသေးပါ' };
    }

    setSyncStatus('syncing');
    try {
      const payload: FullPosData = {
        products,
        sales,
        purchases,
        incomes,
        expenses,
        customers,
        suppliers,
        staff: staffList,
        settings,
      };

      const res = await saveCloudData(payload);
      if (res.success) {
        setSyncStatus('synced');
        const timeStr = new Date().toLocaleTimeString('my-MM', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSyncedTime(timeStr);
        return { success: true, message: `Cloud သို့ ဒေတာအားလုံး အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ (${timeStr})` };
      } else {
        setSyncStatus('error');
        return { success: false, message: res.error || 'Cloud sync error' };
      }
    } catch (err: any) {
      setSyncStatus('error');
      return { success: false, message: err?.message || 'Sync failed' };
    }
  };

  const triggerManualPull = async (): Promise<{ success: boolean; message: string }> => {
    const config = getActiveSupabaseConfig();
    if (!isSupabaseConfigured(config.url, config.anonKey)) {
      return { success: false, message: 'Supabase URL နှင့် Anon Key ကို ထည့်သွင်းထားခြင်း မရှိသေးပါ' };
    }

    setSyncStatus('fetching');
    try {
      const res = await fetchLatestCloudData();
      if (res.success && res.data) {
        const d = res.data;
        isRemoteUpdating.current = true;

        if (Array.isArray(d.products)) setProducts(d.products);
        if (Array.isArray(d.sales)) setSales(d.sales);
        if (Array.isArray(d.purchases)) setPurchases(d.purchases);
        if (Array.isArray(d.incomes)) setIncomes(d.incomes);
        if (Array.isArray(d.expenses)) setExpenses(d.expenses);
        if (Array.isArray(d.customers)) setCustomers(d.customers);
        if (Array.isArray(d.suppliers)) setSuppliers(d.suppliers);
        if (Array.isArray(d.staff) && d.staff.length > 0) setStaffList(d.staff);
        if (d.settings && d.settings.shopName) setSettings(d.settings);

        setSyncStatus('synced');
        const timeStr = new Date().toLocaleTimeString('my-MM', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSyncedTime(timeStr);

        setTimeout(() => {
          isRemoteUpdating.current = false;
        }, 500);

        return { success: true, message: `Cloud မှ ဒေတာများကို အောင်မြင်စွာ ပြန်လည်ရယူပြီးပါပြီ!` };
      } else {
        setSyncStatus('idle');
        return { success: false, message: res.error || 'Cloud data မရှိသေးပါ' };
      }
    } catch (err: any) {
      setSyncStatus('error');
      return { success: false, message: err?.message || 'Pull failed' };
    }
  };

  const setActiveStaff = (staff: StaffUser) => {
    setActiveStaffState(staff);
    setStaffList(prev =>
      prev.map(s => ({
        ...s,
        active: s.id === staff.id,
      }))
    );
  };

  const addProduct = (prod: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...prod,
      id: 'prod-' + Date.now(),
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updated } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addSaleRecord = (sale: Omit<SaleRecord, 'id'>) => {
    const newSale: SaleRecord = {
      ...sale,
      id: 'sale-' + Date.now(),
    };
    setSales(prev => [...prev, newSale]);

    // Update stock
    setProducts(prev =>
      prev.map(p => {
        if (p.barcode === sale.barcode) {
          return { ...p, stockQty: Math.max(0, p.stockQty - sale.qty) };
        }
        return p;
      })
    );

    // Update customer credit if credit sale
    if (sale.paymentMethod === 'Credit' && sale.customerId) {
      setCustomers(prev =>
        prev.map(c => {
          if (c.id === sale.customerId) {
            return { ...c, creditBalance: c.creditBalance + sale.totalAmount };
          }
          return c;
        })
      );
    }
  };

  const addMultipleSaleRecords = (records: Omit<SaleRecord, 'id'>[]) => {
    const newRecords: SaleRecord[] = records.map((r, i) => ({
      ...r,
      id: 'sale-' + Date.now() + '-' + i,
    }));
    setSales(prev => [...prev, ...newRecords]);

    // Update stock for all
    setProducts(prev => {
      const updated = [...prev];
      records.forEach(r => {
        const idx = updated.findIndex(p => p.barcode === r.barcode);
        if (idx !== -1) {
          updated[idx] = {
            ...updated[idx],
            stockQty: Math.max(0, updated[idx].stockQty - r.qty),
          };
        }
      });
      return updated;
    });

    // Credit adjustment if needed
    const firstRec = records[0];
    if (firstRec && firstRec.paymentMethod === 'Credit' && firstRec.customerId) {
      const totalAmount = records.reduce((sum, r) => sum + r.totalAmount, 0);
      setCustomers(prev =>
        prev.map(c => {
          if (c.id === firstRec.customerId) {
            return { ...c, creditBalance: c.creditBalance + totalAmount };
          }
          return c;
        })
      );
    }
  };

  const addPurchaseRecord = (
    purchase: Omit<PurchaseRecord, 'id'>,
    extraProductInfo?: Partial<Product>
  ) => {
    const newPurchase: PurchaseRecord = {
      ...purchase,
      id: 'pur-' + Date.now(),
    };
    setPurchases(prev => [newPurchase, ...prev]);

    // Increase stock or create product if not exists
    setProducts(prev => {
      const idx = prev.findIndex(p => p.barcode === purchase.barcode);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          name: purchase.itemName || updated[idx].name,
          category: purchase.category || updated[idx].category,
          unit: purchase.unit || updated[idx].unit,
          supplier: purchase.supplier || updated[idx].supplier,
          stockQty: updated[idx].stockQty + purchase.qty,
          buyPrice: purchase.buyPrice,
          ...(extraProductInfo || {}),
        };
        return updated;
      } else {
        // Create new product
        const newProduct: Product = {
          id: 'prod-' + Date.now(),
          barcode: purchase.barcode,
          name: purchase.itemName,
          category: purchase.category || 'SHIRT',
          unit: purchase.unit || 'ထည်',
          buyPrice: purchase.buyPrice,
          retailPrice: extraProductInfo?.retailPrice || Math.round(purchase.buyPrice * 1.3),
          wholesalePrice1: extraProductInfo?.wholesalePrice1 || Math.round(purchase.buyPrice * 1.2),
          wholesalePrice2: extraProductInfo?.wholesalePrice2 || Math.round(purchase.buyPrice * 1.15),
          stockQty: purchase.qty,
          minStockLevel: extraProductInfo?.minStockLevel || 5,
          store: purchase.store,
          supplier: purchase.supplier,
          imageUrl: extraProductInfo?.imageUrl || '',
        };
        return [newProduct, ...prev];
      }
    });
  };

  const addIncomeRecord = (income: Omit<IncomeRecord, 'id'>) => {
    const newIncome: IncomeRecord = {
      ...income,
      id: 'inc-' + Date.now(),
    };
    setIncomes(prev => [newIncome, ...prev]);
  };

  const addExpenseRecord = (expense: Omit<ExpenseRecord, 'id'>) => {
    const newExpense: ExpenseRecord = {
      ...expense,
      id: 'exp-' + Date.now(),
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const addCustomer = (cust: Omit<Customer, 'id'>) => {
    const newCust: Customer = {
      ...cust,
      id: 'cust-' + Date.now(),
    };
    setCustomers(prev => [...prev, newCust]);
  };

  const updateCustomer = (id: string, updated: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => (c.id === id ? { ...c, ...updated } : c)));
  };

  const addSupplier = (sup: Omit<Supplier, 'id'>) => {
    const newSup: Supplier = {
      ...sup,
      id: 'sup-' + Date.now(),
    };
    setSuppliers(prev => [...prev, newSup]);
  };

  const updateSupplier = (id: string, updated: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => (s.id === id ? { ...s, ...updated } : s)));
  };

  const addStaff = (staff: Omit<StaffUser, 'id'>) => {
    const newStaff: StaffUser = {
      ...staff,
      id: 'staff-' + Date.now(),
    };
    setStaffList(prev => [...prev, newStaff]);
  };

  const updateStaff = (id: string, updated: Partial<StaffUser>) => {
    setStaffList(prev =>
      prev.map(s => {
        if (s.id === id) {
          const newStaff = { ...s, ...updated };
          if (activeStaff.id === id) {
            setActiveStaffState(newStaff);
          }
          return newStaff;
        }
        return s;
      })
    );
  };

  const deleteStaff = (id: string): { success: boolean; error?: string } => {
    if (staffList.length <= 1) {
      return { success: false, error: 'အနည်းဆုံး အကောင့် ၁ ခု ရှိရပါမည်။ ဖျက်၍မရပါ!' };
    }
    setStaffList(prev => prev.filter(s => s.id !== id));
    if (activeStaff.id === id) {
      const remaining = staffList.filter(s => s.id !== id);
      if (remaining[0]) {
        setActiveStaff(remaining[0]);
      }
    }
    return { success: true };
  };

  const loginWithPin = (pin: string): { success: boolean; staff?: StaffUser; error?: string } => {
    const cleanPin = pin.trim();
    if (!cleanPin) {
      return { success: false, error: 'ကျေးဇူးပြု၍ PIN Code ရိုက်ထည့်ပါ' };
    }
    const matched = staffList.find(s => s.pin === cleanPin);
    if (matched) {
      setActiveStaff(matched);
      return { success: true, staff: matched };
    }
    return { success: false, error: 'မှားယွင်းသော PIN Code ဖြစ်ပါသည်!' };
  };

  const resetAllData = () => {
    setProducts(initialProducts);
    setSales(initialSales);
    setPurchases(initialPurchases);
    setIncomes(initialIncomes);
    setExpenses(initialExpenses);
    setCustomers(initialCustomers);
    setSuppliers(initialSuppliers);
    setStaffList(initialStaff);
    setActiveStaffState(initialStaff[0]);
    setSettings(initialSettings);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        reportSubTab,
        setReportSubTab,
        products,
        setProducts,
        sales,
        setSales,
        purchases,
        setPurchases,
        incomes,
        setIncomes,
        expenses,
        setExpenses,
        customers,
        setCustomers,
        suppliers,
        setSuppliers,
        staffList,
        setStaffList,
        activeStaff,
        setActiveStaff,
        addStaff,
        updateStaff,
        deleteStaff,
        loginWithPin,
        settings,
        setSettings,
        addProduct,
        updateProduct,
        deleteProduct,
        addSaleRecord,
        addMultipleSaleRecords,
        addPurchaseRecord,
        addIncomeRecord,
        addExpenseRecord,
        addCustomer,
        updateCustomer,
        addSupplier,
        updateSupplier,
        resetAllData,
        selectedDate,
        setSelectedDate,
        selectedStore,
        setSelectedStore,
        isStaffModalOpen,
        setIsStaffModalOpen,
        isHelpModalOpen,
        setIsHelpModalOpen,
        isPrintSettingsOpen,
        setIsPrintSettingsOpen,
        isSupabaseModalOpen,
        setIsSupabaseModalOpen,
        syncStatus,
        isRealtimeActive,
        lastSyncedTime,
        remoteSyncNotification,
        setRemoteSyncNotification,
        triggerManualSync,
        triggerManualPull,
        refreshSupabaseConnection,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

