import React, { useState } from 'react';
import {
  Package,
  Users,
  Truck,
  UserCheck,
  Plus,
  Edit,
  Trash2,
  Search,
  Save,
  X,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Phone,
  MapPin,
  Coins,
  DollarSign,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, Customer, Supplier, StaffUser } from '../types';

export const InventoryManageView: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    customers,
    addCustomer,
    updateCustomer,
    suppliers,
    addSupplier,
    updateSupplier,
    staffList,
    selectedStore,
    setCurrentTab,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'products' | 'customers' | 'suppliers' | 'staff'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Omit<Product, 'id'>>({
    barcode: '',
    name: '',
    category: 'SHIRT',
    unit: 'ထည်',
    buyPrice: 0,
    retailPrice: 0,
    wholesalePrice1: 0,
    wholesalePrice2: 0,
    stockQty: 0,
    minStockLevel: 5,
    store: selectedStore,
    supplier: '',
  });

  // Customer Modal State
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [customerForm, setCustomerForm] = useState<Omit<Customer, 'id'>>({
    name: '',
    phone: '',
    address: '',
    creditBalance: 0,
    bonusPoints: 0,
  });

  // Supplier Modal State
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [supplierForm, setSupplierForm] = useState<Omit<Supplier, 'id'>>({
    name: '',
    phone: '',
    address: '',
    debtBalance: 0,
  });

  // Product Delete Confirmation State
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Threshold alert counts
  const lowStockCount = products.filter(
    (p) => p.stockQty > 0 && p.stockQty <= (p.minStockLevel || 5)
  ).length;
  const outOfStockCount = products.filter((p) => p.stockQty <= 0).length;

  const openNewProductModal = () => {
    setEditingProductId(null);
    setProductForm({
      barcode: `SQ${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      category: 'SHIRT',
      unit: 'ထည်',
      buyPrice: 15000,
      retailPrice: 22000,
      wholesalePrice1: 20000,
      wholesalePrice2: 19000,
      stockQty: 50,
      minStockLevel: 5,
      store: selectedStore,
      supplier: suppliers[0]?.name || '',
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProductId(prod.id);
    setProductForm({
      barcode: prod.barcode,
      name: prod.name,
      category: prod.category,
      unit: prod.unit,
      buyPrice: prod.buyPrice,
      retailPrice: prod.retailPrice,
      wholesalePrice1: prod.wholesalePrice1,
      wholesalePrice2: prod.wholesalePrice2,
      stockQty: prod.stockQty,
      minStockLevel: prod.minStockLevel || 5,
      store: prod.store,
      supplier: prod.supplier,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.barcode || !productForm.name) {
      alert('ကျေးဇူးပြု၍ Barcode နှင့် ပစ္စည်းအမည် ဖြည့်သွင်းပါ');
      return;
    }

    if (editingProductId) {
      updateProduct(editingProductId, productForm);
    } else {
      addProduct(productForm);
    }
    setIsProductModalOpen(false);
  };

  // Customer handlers
  const openNewCustomerModal = () => {
    setEditingCustomerId(null);
    setCustomerForm({
      name: '',
      phone: '',
      address: '',
      creditBalance: 0,
      bonusPoints: 0,
    });
    setIsCustomerModalOpen(true);
  };

  const openEditCustomerModal = (c: Customer) => {
    setEditingCustomerId(c.id);
    setCustomerForm({
      name: c.name,
      phone: c.phone,
      address: c.address,
      creditBalance: c.creditBalance,
      bonusPoints: c.bonusPoints,
    });
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name) {
      alert('ကျေးဇူးပြု၍ ဝယ်ယူသူအမည် ဖြည့်သွင်းပါ');
      return;
    }
    if (editingCustomerId) {
      updateCustomer(editingCustomerId, customerForm);
    } else {
      addCustomer(customerForm);
    }
    setIsCustomerModalOpen(false);
  };

  // Supplier handlers
  const openNewSupplierModal = () => {
    setEditingSupplierId(null);
    setSupplierForm({
      name: '',
      phone: '',
      address: '',
      debtBalance: 0,
    });
    setIsSupplierModalOpen(true);
  };

  const openEditSupplierModal = (s: Supplier) => {
    setEditingSupplierId(s.id);
    setSupplierForm({
      name: s.name,
      phone: s.phone,
      address: s.address,
      debtBalance: s.debtBalance,
    });
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name) {
      alert('ကျေးဇူးပြု၍ ကုန်သွင်းသူအမည် ဖြည့်သွင်းပါ');
      return;
    }
    if (editingSupplierId) {
      updateSupplier(editingSupplierId, supplierForm);
    } else {
      addSupplier(supplierForm);
    }
    setIsSupplierModalOpen(false);
  };

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const minThreshold = p.minStockLevel || 5;
    if (stockFilter === 'low' && (p.stockQty <= 0 || p.stockQty > minThreshold)) {
      return false;
    }
    if (stockFilter === 'out' && p.stockQty > 0) {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div id="inventory-manage-container" className="flex-1 flex flex-col h-full bg-white select-none overflow-hidden">
      {/* Sub Navigation Bar with Mobile Horizontal Scroll */}
      <div className="bg-[#f1f3f5] border-b border-gray-300 px-3 md:px-4 pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
        <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none py-0.5">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 md:px-4 py-1.5 text-xs font-bold rounded-t-sm flex items-center space-x-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-[#ff6600] text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-200 border border-b-0 border-gray-300'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>ပစ္စည်းစာရင်းများ ({products.length})</span>
            {(lowStockCount > 0 || outOfStockCount > 0) && (
              <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono animate-pulse">
                {lowStockCount + outOfStockCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3 md:px-4 py-1.5 text-xs font-bold rounded-t-sm flex items-center space-x-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'customers'
                ? 'bg-[#ff6600] text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-200 border border-b-0 border-gray-300'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>ဝယ်ယူသူများ ({customers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-3 md:px-4 py-1.5 text-xs font-bold rounded-t-sm flex items-center space-x-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'suppliers'
                ? 'bg-[#ff6600] text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-200 border border-b-0 border-gray-300'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>ကုန်သွင်းသူများ ({suppliers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`px-3 md:px-4 py-1.5 text-xs font-bold rounded-t-sm flex items-center space-x-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'staff'
                ? 'bg-[#ff6600] text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-200 border border-b-0 border-gray-300'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>ဝန်ထမ်းများ ({staffList.length})</span>
          </button>
        </div>

        {/* Action Button */}
        <div className="pb-1 sm:pb-0 flex items-center space-x-2">
          {activeTab === 'products' && (
            <button
              onClick={openNewProductModal}
              className="bg-[#ff6600] hover:bg-[#e65c00] text-white text-xs font-bold px-3 py-1.5 rounded shadow-xs flex items-center space-x-1 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ပစ္စည်းအသစ် ထည့်မည်</span>
            </button>
          )}

          {activeTab === 'customers' && (
            <button
              onClick={openNewCustomerModal}
              className="bg-[#ff6600] hover:bg-[#e65c00] text-white text-xs font-bold px-3 py-1.5 rounded shadow-xs flex items-center space-x-1 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ဝယ်ယူသူအသစ် ထည့်မည်</span>
            </button>
          )}

          {activeTab === 'suppliers' && (
            <button
              onClick={openNewSupplierModal}
              className="bg-[#ff6600] hover:bg-[#e65c00] text-white text-xs font-bold px-3 py-1.5 rounded shadow-xs flex items-center space-x-1 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ကုန်သွင်းသူအသစ် ထည့်မည်</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 pb-20 md:pb-6">
        {activeTab === 'products' && (
          <div className="space-y-3">
            {/* Low Stock Warning Banner */}
            {(lowStockCount > 0 || outOfStockCount > 0) && (
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-amber-950">
                      သိုလှောင်ရုံ လက်ကျန်နည်းပါးသော ပစ္စည်းသတိပေးချက်
                    </h4>
                    <p className="text-[11px] text-amber-800">
                      လက်ကျန်နည်းပစ္စည်း <strong>{lowStockCount}</strong> မျိုး နှင့် ပစ္စည်းပြတ်လပ် <strong>{outOfStockCount}</strong> မျိုး ရှိနေပါသည်။ ကုန်ပစ္စည်း ပြန်လည်ဖြည့်တင်းရန် လိုအပ်ပါသည်။
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => setStockFilter(stockFilter === 'low' ? 'all' : 'low')}
                    className={`text-xs font-semibold px-2.5 py-1 rounded border cursor-pointer ${
                      stockFilter === 'low'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    လက်ကျန်နည်း စာရင်းကြည့်ရန်
                  </button>
                  <button
                    onClick={() => setCurrentTab('purchase')}
                    className="bg-[#ff6600] hover:bg-[#e65c00] text-white text-xs font-bold px-3 py-1 rounded shadow-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <span>အဝယ်သွင်းမည်</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    placeholder="ပစ္စည်းအမည်၊ Barcode ရှာရန်..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 pl-8 text-xs text-gray-800 focus:outline-none focus:border-[#ff6600]"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                </div>

                {/* Stock Level Quick Filter Tabs */}
                <div className="flex items-center space-x-1 overflow-x-auto">
                  <button
                    onClick={() => setStockFilter('all')}
                    className={`text-[11px] px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                      stockFilter === 'all'
                        ? 'bg-gray-800 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    အားလုံး ({products.length})
                  </button>

                  <button
                    onClick={() => setStockFilter('low')}
                    className={`text-[11px] px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer flex items-center space-x-1 ${
                      stockFilter === 'low'
                        ? 'bg-amber-600 text-white'
                        : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-50'
                    }`}
                  >
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    <span>လက်ကျန်နည်း ({lowStockCount})</span>
                  </button>

                  <button
                    onClick={() => setStockFilter('out')}
                    className={`text-[11px] px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer flex items-center space-x-1 ${
                      stockFilter === 'out'
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-red-700 border border-red-300 hover:bg-red-50'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3 text-red-600" />
                    <span>ပစ္စည်းပြတ် ({outOfStockCount})</span>
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-500 font-mono text-right shrink-0">
                ပြသနေသော ပစ္စည်း: <span className="font-bold text-gray-800">{filteredProducts.length}</span> / {products.length}
              </div>
            </div>

            {/* Products Table with Horizontal Scroll Wrapper */}
            <div className="overflow-x-auto border border-gray-300 rounded shadow-xs bg-white">
              <table className="w-full text-xs text-left border-collapse min-w-[850px]">
                <thead className="bg-[#545b62] text-white font-bold">
                  <tr>
                    <th className="p-2.5 border-r border-gray-600 text-center w-10">စဉ်</th>
                    <th className="p-2.5 border-r border-gray-600">Barcode</th>
                    <th className="p-2.5 border-r border-gray-600">အမည်</th>
                    <th className="p-2.5 border-r border-gray-600">အမျိုးအစား</th>
                    <th className="p-2.5 border-r border-gray-600 text-center">Unit</th>
                    <th className="p-2.5 border-r border-gray-600 text-right">ဝယ်ဈေး</th>
                    <th className="p-2.5 border-r border-gray-600 text-right">လက်လီဈေး</th>
                    <th className="p-2.5 border-r border-gray-600 text-right">လက်ကား ၁</th>
                    <th className="p-2.5 border-r border-gray-600 text-right">လက်ကား ၂</th>
                    <th className="p-2.5 border-r border-gray-600 text-center">သိုလှောင်လက်ကျန် / Status</th>
                    <th className="p-2.5 text-center w-24">လုပ်ဆောင်ချက်</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-6 text-center text-gray-500">
                        ရှာဖွေမှုနှင့် ကိုက်ညီသော ပစ္စည်း မရှိပါ
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p, idx) => {
                      const minThreshold = p.minStockLevel || 5;
                      const isOutOfStock = p.stockQty <= 0;
                      const isLowStock = p.stockQty > 0 && p.stockQty <= minThreshold;

                      return (
                        <tr
                          key={p.id}
                          className={`border-b transition-colors hover:bg-orange-50/40 ${
                            isOutOfStock
                              ? 'bg-red-50/60'
                              : isLowStock
                              ? 'bg-amber-50/50'
                              : idx % 2 === 1
                              ? 'bg-gray-50/50'
                              : 'bg-white'
                          }`}
                        >
                          <td className="p-2.5 border-r border-gray-200 text-center text-gray-500">{idx + 1}</td>
                          <td className="p-2.5 border-r border-gray-200 font-mono font-bold text-gray-900">{p.barcode}</td>
                          <td className="p-2.5 border-r border-gray-200 font-semibold text-gray-900">
                            <div>{p.name}</div>
                            {p.supplier && (
                              <div className="text-[10px] text-gray-400 font-normal">Supplier: {p.supplier}</div>
                            )}
                          </td>
                          <td className="p-2.5 border-r border-gray-200 text-gray-600">{p.category}</td>
                          <td className="p-2.5 border-r border-gray-200 text-center text-gray-700">{p.unit}</td>
                          <td className="p-2.5 border-r border-gray-200 text-right font-mono text-gray-700">{p.buyPrice.toLocaleString()}</td>
                          <td className="p-2.5 border-r border-gray-200 text-right font-mono font-bold text-[#ff6600]">
                            {p.retailPrice.toLocaleString()}
                          </td>
                          <td className="p-2.5 border-r border-gray-200 text-right font-mono text-blue-700">
                            {p.wholesalePrice1.toLocaleString()}
                          </td>
                          <td className="p-2.5 border-r border-gray-200 text-right font-mono text-purple-700">
                            {p.wholesalePrice2.toLocaleString()}
                          </td>

                          {/* Stock Status Badge Column */}
                          <td className="p-2.5 border-r border-gray-200 text-center">
                            {isOutOfStock ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-300 animate-pulse">
                                <AlertTriangle className="w-3 h-3 text-red-600" />
                                <span>ပစ္စည်းပြတ် (0 {p.unit})</span>
                              </span>
                            ) : isLowStock ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                <span>
                                  လက်ကျန်နည်း ({p.stockQty} / Min: {minThreshold} {p.unit})
                                </span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                <span>{p.stockQty} {p.unit}</span>
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-2.5 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => openEditProductModal(p)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                                title="ပြင်ဆင်ရန်"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setProductToDelete(p)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors"
                                title="ဖျက်ရန်"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Customer Tab */}
        {activeTab === 'customers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#ff6600]" />
                <span>ဝယ်ယူသူ ဖောက်သည် စာရင်းများ (Customer Directory)</span>
              </h3>
              <div className="text-xs text-gray-500 font-mono">Total: {customers.length} ဦး</div>
            </div>

            <div className="overflow-x-auto border border-gray-300 rounded shadow-xs bg-white">
              <table className="w-full text-xs text-left border-collapse min-w-[700px]">
                <thead className="bg-[#545b62] text-white font-bold">
                  <tr>
                    <th className="p-2.5 border-r border-gray-600 text-center w-10">စဉ်</th>
                    <th className="p-2.5 border-r border-gray-600">ဝယ်ယူသူအမည်</th>
                    <th className="p-2.5 border-r border-gray-600">ဖုန်းနံပါတ်</th>
                    <th className="p-2.5 border-r border-gray-600">လိပ်စာ</th>
                    <th className="p-2.5 border-r border-gray-600 text-right">ကြွေးကျန်ငွေ (Credit Balance)</th>
                    <th className="p-2.5 border-r border-gray-600 text-center">ဘောနပ်စ်အမှတ်</th>
                    <th className="p-2.5 text-center w-20">လုပ်ဆောင်ချက်</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, i) => (
                    <tr key={c.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-2.5 border-r border-gray-200 text-center text-gray-500">{i + 1}</td>
                      <td className="p-2.5 border-r border-gray-200 font-bold text-gray-900">{c.name}</td>
                      <td className="p-2.5 border-r border-gray-200 font-mono text-gray-800">{c.phone}</td>
                      <td className="p-2.5 border-r border-gray-200 text-gray-600">{c.address}</td>
                      <td className="p-2.5 border-r border-gray-200 text-right font-mono font-bold text-red-600">
                        {c.creditBalance.toLocaleString()} Ks
                      </td>
                      <td className="p-2.5 border-r border-gray-200 text-center font-mono font-bold text-[#ff6600]">
                        {c.bonusPoints} pts
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => openEditCustomerModal(c)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                          title="ပြင်ဆင်ရန်"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Suppliers Tab */}
        {activeTab === 'suppliers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#ff6600]" />
                <span>ကုန်သွင်းသူ ကုန်သည်ကြီးများ စာရင်း (Suppliers)</span>
              </h3>
              <div className="text-xs text-gray-500 font-mono">Total: {suppliers.length} ဦး</div>
            </div>

            <div className="overflow-x-auto border border-gray-300 rounded shadow-xs bg-white">
              <table className="w-full text-xs text-left border-collapse min-w-[700px]">
                <thead className="bg-[#545b62] text-white font-bold">
                  <tr>
                    <th className="p-2.5 border-r border-gray-600 text-center w-10">စဉ်</th>
                    <th className="p-2.5 border-r border-gray-600">ကုန်သွင်းသူအမည်</th>
                    <th className="p-2.5 border-r border-gray-600">ဖုန်းနံပါတ်</th>
                    <th className="p-2.5 border-r border-gray-600">လိပ်စာ</th>
                    <th className="p-2.5 border-r border-gray-600 text-right">ပေးရန်ကျန်ငွေ (Debt Balance)</th>
                    <th className="p-2.5 text-center w-20">လုပ်ဆောင်ချက်</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s, i) => (
                    <tr key={s.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-2.5 border-r border-gray-200 text-center text-gray-500">{i + 1}</td>
                      <td className="p-2.5 border-r border-gray-200 font-bold text-gray-900">{s.name}</td>
                      <td className="p-2.5 border-r border-gray-200 font-mono text-gray-800">{s.phone}</td>
                      <td className="p-2.5 border-r border-gray-200 text-gray-600">{s.address}</td>
                      <td className="p-2.5 border-r border-gray-200 text-right font-mono font-bold text-red-600">
                        {s.debtBalance.toLocaleString()} Ks
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => openEditSupplierModal(s)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                          title="ပြင်ဆင်ရန်"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#ff6600]" />
                <span>ဝန်ထမ်းများနှင့် Cashier စာရင်း (Staff Directory)</span>
              </h3>
              <div className="flex items-center space-x-2">
                <div className="text-xs text-gray-500 font-mono">Total: {staffList.length} ဦး</div>
                <button
                  type="button"
                  onClick={() => setCurrentTab('setting')}
                  className="bg-[#ff6600] hover:bg-[#e65c00] text-white text-xs font-bold px-3 py-1.5 rounded cursor-pointer transition-colors shadow-2xs"
                >
                  Admin / Staff & PIN ပြင်ဆင်ရန် Settings သို့ သွားမည် →
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-300 rounded shadow-xs bg-white">
              <table className="w-full text-xs text-left border-collapse min-w-[650px]">
                <thead className="bg-[#545b62] text-white font-bold">
                  <tr>
                    <th className="p-2.5 border-r border-gray-600 text-center w-10">စဉ်</th>
                    <th className="p-2.5 border-r border-gray-600">အမည်</th>
                    <th className="p-2.5 border-r border-gray-600">ရာထူး / တာဝန်</th>
                    <th className="p-2.5 border-r border-gray-600">တာဝန်ကျ ကောင်တာ</th>
                    <th className="p-2.5 text-center">PIN Code စနစ်</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((st, i) => (
                    <tr key={st.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-2.5 border-r border-gray-200 text-center text-gray-500">{i + 1}</td>
                      <td className="p-2.5 border-r border-gray-200 font-bold text-gray-900">{st.name}</td>
                      <td className="p-2.5 border-r border-gray-200 text-gray-700">{st.role}</td>
                      <td className="p-2.5 border-r border-gray-200 text-gray-700">{st.counter}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-emerald-700">✓ ဖွင့်ထားသည်</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-4 sm:p-5 max-w-lg w-full shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <h3 className="font-bold text-sm text-gray-900">
                {editingProductId ? 'ပစ္စည်းအချက်အလက် ပြင်ဆင်ရန်' : 'ပစ္စည်းအသစ် ထည့်သွင်းရန်'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-0.5">Barcode / Item Code:</label>
                  <input
                    type="text"
                    required
                    value={productForm.barcode}
                    onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                    className="w-full border border-gray-300 rounded p-1.5 font-mono focus:outline-none focus:border-[#ff6600]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-0.5">အမျိုးအစား (Category):</label>
                  <input
                    type="text"
                    required
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full border border-gray-300 rounded p-1.5 focus:outline-none focus:border-[#ff6600]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-0.5">ပစ္စည်းအမည် (Item Name):</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded p-1.5 font-medium focus:outline-none focus:border-[#ff6600]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-0.5">ယူနစ် (Unit):</label>
                  <input
                    type="text"
                    required
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    className="w-full border border-gray-300 rounded p-1.5 focus:outline-none focus:border-[#ff6600]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-0.5">ဝယ်ရင်းဈေး (Buy Price):</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.buyPrice}
                    onChange={(e) => setProductForm({ ...productForm, buyPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded p-1.5 font-mono font-bold focus:outline-none focus:border-[#ff6600]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-50 p-2.5 rounded border border-gray-200">
                <div>
                  <label className="block font-semibold mb-0.5 text-orange-700">လက်လီဈေး:</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.retailPrice}
                    onChange={(e) => setProductForm({ ...productForm, retailPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded p-1.5 font-mono font-bold bg-white focus:outline-none focus:border-[#ff6600]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-0.5 text-blue-700">လက်ကား ၁:</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.wholesalePrice1}
                    onChange={(e) => setProductForm({ ...productForm, wholesalePrice1: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded p-1.5 font-mono bg-white focus:outline-none focus:border-[#ff6600]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-0.5 text-purple-700">လက်ကား ၂:</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.wholesalePrice2}
                    onChange={(e) => setProductForm({ ...productForm, wholesalePrice2: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded p-1.5 font-mono bg-white focus:outline-none focus:border-[#ff6600]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-0.5">လက်ကျန် အရေအတွက် (Stock Qty):</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.stockQty}
                    onChange={(e) => setProductForm({ ...productForm, stockQty: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded p-1.5 font-mono font-bold focus:outline-none focus:border-[#ff6600]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-0.5 text-amber-800">အနည်းဆုံး လက်ကျန် သတ်မှတ်ချက် (Min Alert):</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.minStockLevel || 5}
                    onChange={(e) => setProductForm({ ...productForm, minStockLevel: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-amber-300 bg-amber-50/50 rounded p-1.5 font-mono font-bold focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-0.5">ကုန်သွင်းသူ (Supplier):</label>
                <select
                  value={productForm.supplier}
                  onChange={(e) => setProductForm({ ...productForm, supplier: e.target.value })}
                  className="w-full border border-gray-300 rounded p-1.5 bg-white focus:outline-none focus:border-[#ff6600]"
                >
                  <option value="">-- ကုန်သွင်းသူ ရွေးချယ်ပါ --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-3.5 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold cursor-pointer"
                >
                  မလုပ်ပါ
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded bg-[#ff6600] hover:bg-[#e65c00] text-white font-bold cursor-pointer shadow-xs"
                >
                  သိမ်းဆည်းမည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-lg p-4 sm:p-5 max-w-md w-full shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <h3 className="font-bold text-sm text-gray-900">
                {editingCustomerId ? 'ဝယ်ယူသူ အချက်အလက် ပြင်ဆင်ရန်' : 'ဝယ်ယူသူအသစ် ထည့်သွင်းရန်'}
              </h3>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">ဝယ်ယူသူ အမည်:</label>
                <input
                  type="text"
                  required
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  placeholder="ဖောက်သည် အမည်..."
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-[#ff6600]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ဖုန်းနံပါတ်:</label>
                <input
                  type="text"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  placeholder="09..."
                  className="w-full border border-gray-300 rounded p-2 font-mono focus:outline-none focus:border-[#ff6600]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">လိပ်စာ:</label>
                <input
                  type="text"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  placeholder="မြို့နယ် / လိပ်စာ..."
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-[#ff6600]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">ကြွေးကျန်ငွေ (Credit Balance Ks):</label>
                  <input
                    type="number"
                    min="0"
                    value={customerForm.creditBalance}
                    onChange={(e) => setCustomerForm({ ...customerForm, creditBalance: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">ဘောနပ်စ်အမှတ် (Bonus Points):</label>
                  <input
                    type="number"
                    min="0"
                    value={customerForm.bonusPoints}
                    onChange={(e) => setCustomerForm({ ...customerForm, bonusPoints: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded p-2 font-mono font-bold text-[#ff6600]"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-3.5 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold cursor-pointer"
                >
                  မလုပ်ပါ
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded bg-[#ff6600] hover:bg-[#e65c00] text-white font-bold cursor-pointer shadow-xs"
                >
                  သိမ်းဆည်းမည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-lg p-4 sm:p-5 max-w-md w-full shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <h3 className="font-bold text-sm text-gray-900">
                {editingSupplierId ? 'ကုန်သွင်းသူ အချက်အလက် ပြင်ဆင်ရန်' : 'ကုန်သွင်းသူအသစ် ထည့်သွင်းရန်'}
              </h3>
              <button onClick={() => setIsSupplierModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">ကုန်သွင်းသူ အမည်:</label>
                <input
                  type="text"
                  required
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  placeholder="ကုမ္ပဏီ / ကုန်သည်ကြီး အမည်..."
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-[#ff6600]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ဖုန်းနံပါတ်:</label>
                <input
                  type="text"
                  value={supplierForm.phone}
                  onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                  placeholder="09..."
                  className="w-full border border-gray-300 rounded p-2 font-mono focus:outline-none focus:border-[#ff6600]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">လိပ်စာ:</label>
                <input
                  type="text"
                  value={supplierForm.address}
                  onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  placeholder="လိပ်စာ..."
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-[#ff6600]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ပေးရန်ကျန်ငွေ (Debt Balance Ks):</label>
                <input
                  type="number"
                  min="0"
                  value={supplierForm.debtBalance}
                  onChange={(e) => setSupplierForm({ ...supplierForm, debtBalance: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded p-2 font-mono font-bold text-red-600"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-3.5 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold cursor-pointer"
                >
                  မလုပ်ပါ
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded bg-[#ff6600] hover:bg-[#e65c00] text-white font-bold cursor-pointer shadow-xs"
                >
                  သိမ်းဆည်းမည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Product Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-2xs z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-red-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-sm">ပစ္စည်းဖျက်သိမ်းရန် အတည်ပြုခြင်း</h3>
              </div>
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="text-white/80 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <p className="text-gray-700 leading-relaxed font-medium">
                <strong>"{productToDelete.name}"</strong> (ကုတ်: <span className="font-mono font-bold text-gray-900">{productToDelete.barcode}</span>) အား စာရင်းထဲမှ အပြီးဖျက်မည်မှာ သေချာပါသလား?
              </p>

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold cursor-pointer"
                >
                  မဖျက်ပါ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteProduct(productToDelete.id);
                    setProductToDelete(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer flex items-center space-x-1.5 shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>သေချာသည်၊ ဖျက်မည်</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
