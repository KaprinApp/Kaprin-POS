import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  Download,
  Upload,
  UploadCloud,
  Check,
  Printer,
  Shield,
  Users,
  UserPlus,
  KeyRound,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Lock,
  AlertTriangle,
  X,
  AlertCircle,
  Database,
  RefreshCw,
  Server,
  CloudCheck,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StaffUser } from '../types';
import {
  isSupabaseConfigured,
  testSupabaseConnection,
  getActiveSupabaseConfig,
  getCustomSupabaseClient,
} from '../lib/supabase';

export const SettingsView: React.FC = () => {
  const {
    settings,
    setSettings,
    staffList,
    setStaffList,
    addStaff,
    updateStaff,
    deleteStaff,
    activeStaff,
    setActiveStaff,
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
  } = useApp();

  const [formData, setFormData] = useState(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  // Supabase Configuration State
  const [supabaseUrl, setSupabaseUrl] = useState(() => getActiveSupabaseConfig().url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => getActiveSupabaseConfig().anonKey);
  const [showAnonKey, setShowAnonKey] = useState(false);
  const [supabaseTesting, setSupabaseTesting] = useState(false);
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [showSqlSchemaModal, setShowSqlSchemaModal] = useState(false);


  // Staff Management State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('Admin');
  const [staffCounter, setStaffCounter] = useState('ကောင်တာ ၁');
  const [staffPin, setStaffPin] = useState('');
  const [showPins, setShowPins] = useState<{ [id: string]: boolean }>({});
  const [staffActionMsg, setStaffActionMsg] = useState('');
  const [staffActionError, setStaffActionError] = useState('');
  const [staffModalError, setStaffModalError] = useState('');

  // In-app Delete Confirmation State
  const [staffToDelete, setStaffToDelete] = useState<StaffUser | null>(null);

  const togglePinVisibility = (id: string) => {
    setShowPins((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleOpenAddStaff = () => {
    setEditingStaffId(null);
    setStaffName('');
    setStaffRole('Cashier');
    setStaffCounter('ကောင်တာ ၁');
    setStaffPin('');
    setStaffModalError('');
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaff = (st: StaffUser) => {
    setEditingStaffId(st.id);
    setStaffName(st.name);
    setStaffRole(st.role);
    setStaffCounter(st.counter);
    setStaffPin(st.pin);
    setStaffModalError('');
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffModalError('');

    if (!staffName.trim() || !staffPin.trim()) {
      setStaffModalError('ကျေးဇူးပြု၍ အမည်နှင့် PIN Code ကို ပြည့်စုံစွာ ဖြည့်သွင်းပါ');
      return;
    }

    if (editingStaffId) {
      // Check duplicate PIN on other staff
      const duplicate = staffList.find(s => s.id !== editingStaffId && s.pin === staffPin.trim());
      if (duplicate) {
        setStaffModalError(`ဤ PIN Code (${staffPin}) အား "${duplicate.name}" တွင် အသုံးပြုထားပြီးဖြစ်ပါသည်။ အခြား PIN Code သတ်မှတ်ပါ`);
        return;
      }

      updateStaff(editingStaffId, {
        name: staffName.trim(),
        role: staffRole,
        counter: staffCounter,
        pin: staffPin.trim(),
      });
      setStaffActionMsg(`"${staffName}" ၏ အကောင့်နှင့် PIN Code ကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ။`);
      setStaffActionError('');
    } else {
      // Check duplicate PIN
      const duplicate = staffList.find(s => s.pin === staffPin.trim());
      if (duplicate) {
        setStaffModalError(`ဤ PIN Code (${staffPin}) အား "${duplicate.name}" တွင် အသုံးပြုထားပြီးဖြစ်ပါသည်။ အခြား PIN Code သတ်မှတ်ပါ`);
        return;
      }

      addStaff({
        name: staffName.trim(),
        role: staffRole,
        counter: staffCounter,
        pin: staffPin.trim(),
        active: false,
      });
      setStaffActionMsg(`"${staffName}" ၏ အကောင့်အသစ်အား ကိုယ်ပိုင် PIN (${staffPin}) ဖြင့် ထည့်သွင်းပြီးပါပြီ။`);
      setStaffActionError('');
    }

    setIsStaffModalOpen(false);
    setTimeout(() => setStaffActionMsg(''), 4000);
  };

  const confirmDeleteStaff = () => {
    if (!staffToDelete) return;

    if (staffList.length <= 1) {
      setStaffActionError('အနည်းဆုံး အကောင့် ၁ ခု ရှိရပါမည်။ ဤအကောင့်အား ဖျက်၍မရပါ!');
      setStaffToDelete(null);
      setTimeout(() => setStaffActionError(''), 4000);
      return;
    }

    const res = deleteStaff(staffToDelete.id);
    if (res.success) {
      setStaffActionMsg(`"${staffToDelete.name}" အကောင့်အား အောင်မြင်စွာ ဖျက်သိမ်းပြီးပါပြီ။`);
      setStaffActionError('');
      if (editingStaffId === staffToDelete.id) {
        setIsStaffModalOpen(false);
        setEditingStaffId(null);
      }
    } else {
      setStaffActionError(res.error || 'အကောင့်ဖျက်ရာတွင် အမှားဖြစ်ပေါ်နေပါသည်');
    }

    setStaffToDelete(null);
    setTimeout(() => {
      setStaffActionMsg('');
      setStaffActionError('');
    }, 4000);
  };

  const handleExportBackup = () => {
    const backup = {
      products: localStorage.getItem('pos_products'),
      sales: localStorage.getItem('pos_sales'),
      purchases: localStorage.getItem('pos_purchases'),
      incomes: localStorage.getItem('pos_incomes'),
      expenses: localStorage.getItem('pos_expenses'),
      customers: localStorage.getItem('pos_customers'),
      suppliers: localStorage.getItem('pos_suppliers'),
      staff: localStorage.getItem('pos_staff'),
      settings: JSON.stringify(formData),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `POS_Backup_${Date.now()}.json`;
    a.click();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const backup = JSON.parse(content);
        if (backup.products) {
          const parsed = typeof backup.products === 'string' ? JSON.parse(backup.products) : backup.products;
          setProducts(parsed);
          localStorage.setItem('pos_products', JSON.stringify(parsed));
        }
        if (backup.sales) {
          const parsed = typeof backup.sales === 'string' ? JSON.parse(backup.sales) : backup.sales;
          setSales(parsed);
          localStorage.setItem('pos_sales', JSON.stringify(parsed));
        }
        if (backup.purchases) {
          const parsed = typeof backup.purchases === 'string' ? JSON.parse(backup.purchases) : backup.purchases;
          setPurchases(parsed);
          localStorage.setItem('pos_purchases', JSON.stringify(parsed));
        }
        if (backup.incomes) {
          const parsed = typeof backup.incomes === 'string' ? JSON.parse(backup.incomes) : backup.incomes;
          setIncomes(parsed);
          localStorage.setItem('pos_incomes', JSON.stringify(parsed));
        }
        if (backup.expenses) {
          const parsed = typeof backup.expenses === 'string' ? JSON.parse(backup.expenses) : backup.expenses;
          setExpenses(parsed);
          localStorage.setItem('pos_expenses', JSON.stringify(parsed));
        }
        if (backup.customers) {
          const parsed = typeof backup.customers === 'string' ? JSON.parse(backup.customers) : backup.customers;
          setCustomers(parsed);
          localStorage.setItem('pos_customers', JSON.stringify(parsed));
        }
        if (backup.suppliers) {
          const parsed = typeof backup.suppliers === 'string' ? JSON.parse(backup.suppliers) : backup.suppliers;
          setSuppliers(parsed);
          localStorage.setItem('pos_suppliers', JSON.stringify(parsed));
        }
        if (backup.staff) {
          const parsed = typeof backup.staff === 'string' ? JSON.parse(backup.staff) : backup.staff;
          setStaffList(parsed);
          localStorage.setItem('pos_staff', JSON.stringify(parsed));
        }
        if (backup.settings) {
          const parsed = typeof backup.settings === 'string' ? JSON.parse(backup.settings) : backup.settings;
          setSettings(parsed);
          setFormData(parsed);
          localStorage.setItem('pos_settings', JSON.stringify(parsed));
        }
        setStaffActionMsg('Database Backup File မှ အချက်အလက်များကို အောင်မြင်စွာ ပြန်လည်ရယူပြီးပါပြီ (Data Restored Successfully)');
        setTimeout(() => setStaffActionMsg(''), 5000);
      } catch (err) {
        setStaffActionError('ရွေးချယ်ထားသော Backup File မှားယွင်းနေပါသည် သို့မဟုတ် ဖတ်၍မရပါ');
        setTimeout(() => setStaffActionError(''), 5000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Supabase Handlers
  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('pos_supabase_url', supabaseUrl.trim());
    localStorage.setItem('pos_supabase_anon_key', supabaseAnonKey.trim());
    setSupabaseStatusMsg({
      type: 'success',
      text: 'Supabase URL နှင့် Anon Key ကို သိမ်းဆည်းပြီးပါပြီ။',
    });
    setTimeout(() => setSupabaseStatusMsg(null), 4000);
  };

  const handleTestSupabase = async () => {
    setSupabaseTesting(true);
    setSupabaseStatusMsg(null);
    try {
      const res = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
      if (res.success) {
        setSupabaseStatusMsg({ type: 'success', text: res.message });
      } else {
        setSupabaseStatusMsg({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setSupabaseStatusMsg({
        type: 'error',
        text: `ချိတ်ဆက်မှု မအောင်မြင်ပါ: ${err?.message || 'Unknown Error'}`,
      });
    } finally {
      setSupabaseTesting(false);
    }
  };

  const handleSyncToSupabase = async () => {
    if (!isSupabaseConfigured(supabaseUrl, supabaseAnonKey)) {
      setSupabaseStatusMsg({
        type: 'error',
        text: 'ကျေးဇူးပြု၍ Supabase URL နှင့် Anon Key ကို ဦးစွာ ထည့်သွင်းသိမ်းဆည်းပါ',
      });
      return;
    }

    setIsSyncingCloud(true);
    setSupabaseStatusMsg({ type: 'info', text: 'Supabase Cloud Database သို့ ဒေတာများ သိမ်းဆည်းနေပါသည်...' });

    try {
      const client = getCustomSupabaseClient(supabaseUrl, supabaseAnonKey);
      if (!client) {
        throw new Error('Supabase client initialize မလုပ်နိုင်ပါ');
      }

      // Upsert backup metadata record
      const backupPayload = {
        id: 'latest_backup',
        shop_name: formData.shopName,
        phone: formData.phone,
        total_products: products.length,
        total_sales: sales.length,
        total_purchases: purchases.length,
        total_customers: customers.length,
        data_json: {
          products,
          sales,
          purchases,
          incomes,
          expenses,
          customers,
          suppliers,
          staff: staffList,
          settings: formData,
        },
        updated_at: new Date().toISOString(),
      };

      const { error } = await client
        .from('pos_backups')
        .upsert(backupPayload, { onConflict: 'id' });

      if (error) {
        if (error.message.includes('relation "pos_backups" does not exist')) {
          setSupabaseStatusMsg({
            type: 'error',
            text: 'Supabase တွင် "pos_backups" table မရှိသေးပါ။ အောက်ပါ "SQL Schema ကြည့်မည်" ကိုနှိပ်ပြီး Table တည်ဆောက်ပေးပါ။',
          });
        } else {
          setSupabaseStatusMsg({
            type: 'error',
            text: `Sync Error: ${error.message}`,
          });
        }
      } else {
        setSupabaseStatusMsg({
          type: 'success',
          text: `ပစ္စည်း (${products.length}) ခုနှင့် စာရင်းအားလုံးကို Supabase Cloud သို့ အောင်မြင်စွာ Sync လုပ်ပြီးပါပြီ!`,
        });
      }
    } catch (err: any) {
      setSupabaseStatusMsg({
        type: 'error',
        text: `Cloud Sync မအောင်မြင်ပါ: ${err?.message || 'Network Error'}`,
      });
    } finally {
      setIsSyncingCloud(false);
    }
  };


  return (
    <div id="settings-view-container" className="flex-1 flex flex-col h-full bg-white select-none overflow-y-auto p-4 md:p-6 pb-24 md:pb-8">
      <div className="flex items-center space-x-2 border-b pb-3 mb-4">
        <Settings className="w-5 h-5 text-[#ff6600]" />
        <div>
          <h2 className="text-base font-bold text-gray-900">ဆိုင်နှင့် စနစ် ဆက်တင်များ (System Settings)</h2>
          <p className="text-xs text-gray-500">Admin/Staff PIN Codes၊ ဘောက်ချာ ခေါင်းစီး၊ Printer ပုံစံနှင့် ဒေတာ ထိန်းသိမ်းမှုများ</p>
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* SECTION 1: Admin & Staff Management */}
        <div className="bg-orange-50/40 border border-orange-200 rounded-lg p-4 md:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-orange-200 pb-2">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-[#ff6600]" />
              <div>
                <h3 className="font-bold text-sm text-gray-900">Admin & Staff PIN Code စီမံခန့်ခွဲမှု</h3>
                <p className="text-[11px] text-gray-600">Admin နှင့် Cashier များအတွက် ကိုယ်ပိုင် လျှို့ဝှက်ကုဒ် (PIN) သတ်မှတ်ခြင်း</p>
              </div>
            </div>
            <button
              id="btn-add-new-staff"
              type="button"
              onClick={handleOpenAddStaff}
              className="bg-[#ff6600] hover:bg-[#e65c00] text-white text-xs font-bold px-3 py-1.5 rounded flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-colors self-start sm:self-auto"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Admin / Staff အသစ်ထည့်ရန်</span>
            </button>
          </div>

          {staffActionMsg && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{staffActionMsg}</span>
            </div>
          )}

          {staffActionError && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 rounded text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{staffActionError}</span>
            </div>
          )}

          {/* Staff List Table */}
          <div className="overflow-x-auto bg-white rounded border border-gray-200 shadow-2xs">
            <table className="w-full text-xs text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                  <th className="p-2.5 text-center w-12">စဉ်</th>
                  <th className="p-2.5">အမည်</th>
                  <th className="p-2.5">ရာထူး (Role)</th>
                  <th className="p-2.5">ကောင်တာ</th>
                  <th className="p-2.5">ကိုယ်ပိုင် Login Code (PIN)</th>
                  <th className="p-2.5 text-center">အခြေအနေ</th>
                  <th className="p-2.5 text-center w-28">လုပ်ဆောင်ချက်</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((st, idx) => {
                  const isActive = activeStaff?.id === st.id;
                  const isPinVisible = !!showPins[st.id];

                  return (
                    <tr key={st.id} className={`border-b hover:bg-gray-50/80 transition-colors ${isActive ? 'bg-orange-50/40' : ''}`}>
                      <td className="p-2.5 text-center text-gray-500">{idx + 1}</td>
                      <td className="p-2.5 font-bold text-gray-900 flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gray-800 text-white flex items-center justify-center text-[10px] font-bold">
                          {st.name.charAt(0)}
                        </div>
                        <span>{st.name}</span>
                      </td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          st.role.includes('Admin') || st.role.includes('Owner')
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {st.role}
                        </span>
                      </td>
                      <td className="p-2.5 text-gray-700">{st.counter}</td>
                      <td className="p-2.5 font-mono font-bold text-gray-900">
                        <div className="flex items-center space-x-1.5">
                          <span className="bg-gray-100 border border-gray-300 px-2 py-0.5 rounded text-xs tracking-wider">
                            {isPinVisible ? st.pin : '••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePinVisibility(st.id)}
                            className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
                            title={isPinVisible ? 'PIN ဖွက်မည်' : 'PIN ကြည့်မည်'}
                          >
                            {isPinVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="p-2.5 text-center">
                        {isActive ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            <span>Active Login</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveStaff(st)}
                            className="text-gray-500 hover:text-[#ff6600] font-semibold text-[11px] hover:underline cursor-pointer"
                          >
                            Switch to this
                          </button>
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            id={`btn-edit-staff-${st.id}`}
                            type="button"
                            onClick={() => handleOpenEditStaff(st)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded border border-transparent hover:border-blue-200 cursor-pointer transition-colors"
                            title="Edit Staff & PIN Code"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-delete-staff-${st.id}`}
                            type="button"
                            onClick={() => setStaffToDelete(st)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded border border-transparent hover:border-red-200 cursor-pointer transition-colors"
                            title="Delete Staff"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 2: Store Information & Receipt Slip Config */}
        <form onSubmit={handleSave} className="space-y-4 md:space-y-5 text-xs">
          {/* Shop Info Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
            <h3 className="font-bold text-sm text-gray-800 border-b pb-1">ဆိုင် အချက်အလက်များ</h3>

            <div>
              <label className="block font-semibold mb-1">ဆိုင်အမည် (Shop Name):</label>
              <input
                type="text"
                required
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded p-2 text-xs font-bold focus:outline-none focus:border-[#ff6600]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">ဖုန်းနံပါတ် (Phone Number):</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded p-2 text-xs font-mono focus:outline-none focus:border-[#ff6600]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">မူလ ဆိုင်ခွဲ (Default Store):</label>
                <input
                  type="text"
                  required
                  value={formData.defaultStore}
                  onChange={(e) => setFormData({ ...formData, defaultStore: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded p-2 text-xs focus:outline-none focus:border-[#ff6600]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">ဆိုင်လိပ်စာ (Shop Address):</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded p-2 text-xs focus:outline-none focus:border-[#ff6600]"
              />
            </div>
          </div>

          {/* Receipt Slip Config */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
            <h3 className="font-bold text-sm text-gray-800 border-b pb-1 flex items-center gap-1.5">
              <Printer className="w-4 h-4 text-gray-700" />
              <span>ဘောက်ချာနှင့် Printer ဆက်တင်များ</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Printer အရွယ်အစား:</label>
                <select
                  value={formData.printerType}
                  onChange={(e) => setFormData({ ...formData, printerType: e.target.value as any })}
                  className="w-full bg-white border border-gray-300 rounded p-2 text-xs focus:outline-none focus:border-[#ff6600]"
                >
                  <option value="80mm">Thermal 80mm (စံပြေစာအရွယ်)</option>
                  <option value="58mm">Thermal 58mm (အသေးစား)</option>
                  <option value="A4">A4 / A5 စာရွက် အပြည့်</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">အလိုအလျောက် Print ထုတ်မည်:</label>
                <select
                  value={formData.autoPrint ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, autoPrint: e.target.value === 'true' })}
                  className="w-full bg-white border border-gray-300 rounded p-2 text-xs focus:outline-none focus:border-[#ff6600]"
                >
                  <option value="true">ဖွင့်ထားမည် (Auto Print)</option>
                  <option value="false">ပိတ်ထားမည် (Manual)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">ဘောက်ချာ ထိပ်စီးစာ (Receipt Header):</label>
              <textarea
                rows={2}
                value={formData.receiptHeader}
                onChange={(e) => setFormData({ ...formData, receiptHeader: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded p-2 text-xs focus:outline-none focus:border-[#ff6600]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">ဘောက်ချာ အောက်ခြေစာ (Receipt Footer):</label>
              <textarea
                rows={2}
                value={formData.receiptFooter}
                onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded p-2 text-xs focus:outline-none focus:border-[#ff6600]"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="btn-save-settings"
              type="submit"
              className="bg-[#ff6600] hover:bg-[#e65c00] text-white font-bold px-6 py-2.5 rounded shadow-xs cursor-pointer flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>

            {saveSuccess && (
              <div className="text-emerald-700 flex items-center space-x-1 font-semibold text-xs animate-in fade-in">
                <Check className="w-4 h-4" />
                <span>ဆက်တင်များ သိမ်းဆည်းပြီးပါပြီ!</span>
              </div>
            )}
          </div>
        </form>

        {/* SECTION 3: Supabase Cloud Database Integration (Clean & Collapsible) */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-2">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-[#ff6600]" />
              <h3 className="font-bold text-sm text-gray-800">Supabase Cloud Database</h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isSupabaseConfigured(supabaseUrl, supabaseAnonKey)
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {isSupabaseConfigured(supabaseUrl, supabaseAnonKey) ? 'ချိတ်ဆက်ထားသည်' : 'မချိတ်ဆက်ရသေးပါ'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowSqlSchemaModal(true)}
              className="text-[11px] text-[#ff6600] hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <Server className="w-3.5 h-3.5" />
              <span>SQL Schema ကြည့်မည်</span>
            </button>
          </div>

          {supabaseStatusMsg && (
            <div className={`p-2.5 rounded text-xs font-medium flex items-center space-x-2 ${
              supabaseStatusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : supabaseStatusMsg.type === 'error'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {supabaseStatusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{supabaseStatusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveSupabaseConfig} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Project URL:</label>
              <input
                type="text"
                required
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://YOUR_PROJECT_ID.supabase.co"
                className="w-full bg-white border border-gray-300 rounded p-2 text-xs font-mono focus:outline-none focus:border-[#ff6600]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-gray-700">Anon Public Key:</label>
              <div className="relative">
                <input
                  type={showAnonKey ? 'text' : 'password'}
                  required
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-white border border-gray-300 rounded p-2 pr-9 text-xs font-mono focus:outline-none focus:border-[#ff6600]"
                />
                <button
                  type="button"
                  onClick={() => setShowAnonKey(!showAnonKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showAnonKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                id="btn-save-supabase-config"
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded cursor-pointer flex items-center space-x-1 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>

              <button
                id="btn-test-supabase-connection"
                type="button"
                disabled={supabaseTesting}
                onClick={handleTestSupabase}
                className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold px-3 py-1.5 rounded cursor-pointer flex items-center space-x-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${supabaseTesting ? 'animate-spin' : ''}`} />
                <span>{supabaseTesting ? 'စစ်ဆေးနေသည်...' : 'Test Connection'}</span>
              </button>

              <button
                id="btn-sync-supabase-data"
                type="button"
                disabled={isSyncingCloud}
                onClick={handleSyncToSupabase}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-1.5 rounded cursor-pointer flex items-center space-x-1 shadow-xs disabled:opacity-50"
              >
                <UploadCloud className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-bounce' : ''}`} />
                <span>{isSyncingCloud ? 'သိမ်းနေသည်...' : 'Sync to Cloud'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* SECTION 4: Backup & Restore Section */}
        <div className="pt-6 border-t border-gray-200 space-y-3">
          <h3 className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-gray-600" />
            <span>ဒေတာ ထိန်းသိမ်းမှု (Database Backup & Restore)</span>
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <button
              id="btn-export-backup"
              type="button"
              onClick={handleExportBackup}
              className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800 font-semibold px-4 py-2.5 rounded flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#ff6600]" />
              <span>Export Database Backup (.json ဒေါင်းလုဒ်ဆွဲမည်)</span>
            </button>

            <label className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-semibold px-4 py-2.5 rounded flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-colors">
              <Upload className="w-3.5 h-3.5 text-emerald-700" />
              <span>Restore Database Backup (.json ပြန်တင်မည်)</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* MODAL 1: Add / Edit Staff & Custom PIN Code */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-[#ff6600]" />
                <h3 className="font-bold text-sm">
                  {editingStaffId ? 'Admin / Staff PIN Code ပြင်ဆင်ရန်' : 'Admin / Staff အသစ်နှင့် PIN Code သတ်မှတ်ရန်'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-5 space-y-3.5 text-xs">
              {staffModalError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{staffModalError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1 text-gray-700">အကောင့်ပိုင်ရှင် အမည် (Staff / Admin Name):</label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => {
                    setStaffName(e.target.value);
                    setStaffModalError('');
                  }}
                  placeholder="ဥပမာ: ဦးမောင်မောင် / Admin 1 / မသီတာ"
                  className="w-full border border-gray-300 rounded-lg p-2 font-medium focus:outline-none focus:border-[#ff6600]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">ရာထူး (Role):</label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-gray-800 focus:outline-none focus:border-[#ff6600]"
                  >
                    <option value="Admin">Admin (အုပ်ချုပ်သူ)</option>
                    <option value="Shop Owner">Shop Owner (ဆိုင်ရှင်)</option>
                    <option value="Manager">Manager (မန်နေဂျာ)</option>
                    <option value="Cashier">Cashier (ငွေကိုင်ဝန်ထမ်း)</option>
                    <option value="Staff">Staff (အရောင်းဝန်ထမ်း)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-700">တာဝန်ကျ ကောင်တာ:</label>
                  <input
                    type="text"
                    required
                    value={staffCounter}
                    onChange={(e) => setStaffCounter(e.target.value)}
                    placeholder="ဥပမာ: ကောင်တာ ၁"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-[#ff6600]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 flex items-center space-x-1">
                  <KeyRound className="w-3.5 h-3.5 text-[#ff6600]" />
                  <span>ကိုယ်ပိုင် Login Code / PIN (၄ လုံးမှ ၆ လုံး သတ်မှတ်ပါ):</span>
                </label>
                <input
                  type="text"
                  required
                  value={staffPin}
                  onChange={(e) => {
                    setStaffPin(e.target.value);
                    setStaffModalError('');
                  }}
                  placeholder="ဥပမာ: 1234 သို့မဟုတ် 9876"
                  className="w-full border border-gray-300 rounded-lg p-2 font-mono font-bold text-sm tracking-widest focus:outline-none focus:border-[#ff6600]"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  အကောင့်ဝင်ရောက်သည့်အခါ ဤ PIN Code အား ရိုက်ထည့်ပြီး ချက်ချင်း အသုံးပြုနိုင်မည်ဖြစ်ပါသည်။
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
                {editingStaffId ? (
                  <button
                    id="btn-modal-delete-staff"
                    type="button"
                    onClick={() => {
                      const target = staffList.find((s) => s.id === editingStaffId);
                      if (target) {
                        setStaffToDelete(target);
                      }
                    }}
                    className="px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-200 cursor-pointer flex items-center space-x-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>အကောင့်ဖျက်မည်</span>
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsStaffModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold cursor-pointer"
                  >
                    ပယ်ဖျက်မည်
                  </button>
                  <button
                    id="btn-modal-save-staff"
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#ff6600] hover:bg-[#e65c00] text-white font-bold cursor-pointer flex items-center space-x-1.5 shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingStaffId ? 'သိမ်းဆည်းမည်' : 'အကောင့်အသစ် ထည့်မည်'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: In-App Delete Staff Confirmation Dialog */}
      {staffToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-2xs z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-red-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-sm">အကောင့်ဖျက်သိမ်းရန် အတည်ပြုခြင်း</h3>
              </div>
              <button
                type="button"
                onClick={() => setStaffToDelete(null)}
                className="text-white/80 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="w-10 h-10 rounded-full bg-gray-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  {staffToDelete.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-900">{staffToDelete.name}</div>
                  <div className="text-gray-500 text-[11px]">{staffToDelete.role} • {staffToDelete.counter}</div>
                  <div className="text-gray-400 text-[10px] font-mono">PIN: {staffToDelete.pin}</div>
                </div>
              </div>

              {staffList.length <= 1 ? (
                <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-lg font-medium text-[11px]">
                  ⚠️ သတိပေးချက်: စနစ်အတွင်း အနည်းဆုံး Admin / Staff အကောင့် ၁ ခု ရှိရပါမည်။ ဤနောက်ဆုံးအကောင့်အား ဖျက်၍မရပါ။
                </div>
              ) : (
                <p className="text-gray-700 leading-relaxed font-medium">
                  <strong>"{staffToDelete.name}"</strong> ၏ အကောင့်အား စနစ်ထဲမှ အပြီးဖျက်မည်မှာ သေချာပါသလား? ဖျက်ပြီးပါက ပြန်လည်ရယူ၍ မရနိုင်ပါ။
                </p>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setStaffToDelete(null)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold cursor-pointer"
                >
                  မဖျက်ပါ
                </button>
                <button
                  id="btn-confirm-delete-staff"
                  type="button"
                  disabled={staffList.length <= 1}
                  onClick={confirmDeleteStaff}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold cursor-pointer flex items-center space-x-1.5 shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>သေချာသည်၊ ဖျက်မည်</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Supabase SQL Schema Viewer & Copy Modal */}
      {showSqlSchemaModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-2xs z-60 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-xl max-w-lg w-full shadow-2xl border border-slate-700 overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-800 p-4 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Supabase SQL Schema & Setup Guide</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSqlSchemaModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs text-slate-300">
              <p className="leading-relaxed">
                Supabase Dashboard &gt; <strong className="text-white">SQL Editor</strong> သို့ သွား၍ အောက်ပါ SQL Query ကို Run ပေးပါ:
              </p>

              <div className="relative bg-slate-950 rounded-lg p-3 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-60">
                <pre>{`-- 1. Create table for POS data
CREATE TABLE IF NOT EXISTS pos_backups (
  id TEXT PRIMARY KEY,
  shop_name TEXT,
  phone TEXT,
  total_products INT,
  total_sales INT,
  total_purchases INT,
  total_customers INT,
  data_json JSONB,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE pos_backups ENABLE ROW LEVEL SECURITY;

-- 3. Allow Public Anon Read & Write
CREATE POLICY "Allow public anon access" 
ON pos_backups 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);`}</pre>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    const sql = `-- 1. Create table for POS data
CREATE TABLE IF NOT EXISTS pos_backups (
  id TEXT PRIMARY KEY,
  shop_name TEXT,
  phone TEXT,
  total_products INT,
  total_sales INT,
  total_purchases INT,
  total_customers INT,
  data_json JSONB,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE pos_backups ENABLE ROW LEVEL SECURITY;

-- 3. Allow Public Anon Access
CREATE POLICY "Allow public anon access" 
ON pos_backups 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);`;
                    navigator.clipboard.writeText(sql);
                    alert('SQL Schema Copy ကူးယူပြီးပါပြီ!');
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-colors"
                >
                  Copy SQL Script
                </button>

                <button
                  type="button"
                  onClick={() => setShowSqlSchemaModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  ပိတ်မည်
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
