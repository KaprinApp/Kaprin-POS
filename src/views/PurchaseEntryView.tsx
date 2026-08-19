import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Barcode,
  CheckCircle,
  Package,
  Layers,
  Sparkles,
  Edit3,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';
import { ProductImagePicker } from '../components/ProductImagePicker';

export const PurchaseEntryView: React.FC = () => {
  const {
    products,
    suppliers,
    selectedStore,
    addPurchaseRecord,
    purchases,
  } = useApp();

  // Mode: 'existing' or 'new_custom'
  const [entryMode, setEntryMode] = useState<'existing' | 'new_custom'>('new_custom');

  const [barcode, setBarcode] = useState(`SQ${Math.floor(100 + Math.random() * 900)}`);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('SHIRT');
  const [unit, setUnit] = useState('ထည်');
  const [qty, setQty] = useState<number>(50);
  const [buyPrice, setBuyPrice] = useState<number>(20000);
  const [retailPrice, setRetailPrice] = useState<number>(26000);
  const [wholesalePrice1, setWholesalePrice1] = useState<number>(25000);
  const [wholesalePrice2, setWholesalePrice2] = useState<number>(24000);
  const [wholesalePrice3, setWholesalePrice3] = useState<number>(23000);
  const [supplier, setSupplier] = useState(suppliers[0]?.name || 'Royal Supply');
  const [customSupplier, setCustomSupplier] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const commonCategories = ['SHIRT', 'Tshirt', 'card', 'PANTS', 'ACCESSORIES', 'FOOTWEAR', 'COSMETICS', 'FOOD', 'DRINK'];
  const commonUnits = ['ထည်', 'ခု', 'ဘူး', 'ထုပ်', 'လုံး', 'တွဲ', 'ကတ်', 'ဖာ', 'ဒါဇင်', 'card'];

  // Helper to remove annoying leading zero (e.g. typing 10 when 0 was in input becoming 010)
  const parseCleanNumber = (valStr: string): number => {
    const cleaned = valStr.replace(/^0+(?=\d)/, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleProductSelect = (selectedBarcode: string) => {
    if (!selectedBarcode) {
      setEntryMode('new_custom');
      setBarcode(`SQ${Math.floor(100 + Math.random() * 900)}`);
      setItemName('');
      setImageUrl('');
      return;
    }

    const matched = products.find((p) => p.barcode === selectedBarcode);
    if (matched) {
      setBarcode(matched.barcode);
      setItemName(matched.name);
      setCategory(matched.category);
      setUnit(matched.unit);
      setBuyPrice(matched.buyPrice);
      setRetailPrice(matched.retailPrice || Math.round(matched.buyPrice * 1.3));
      setWholesalePrice1(matched.wholesalePrice1 || Math.round(matched.buyPrice * 1.25));
      setWholesalePrice2(matched.wholesalePrice2 || Math.round(matched.buyPrice * 1.2));
      setWholesalePrice3(matched.wholesalePrice3 || Math.round(matched.buyPrice * 1.15));
      setSupplier(matched.supplier || suppliers[0]?.name || '');
      setImageUrl(matched.imageUrl || '');
      setEntryMode('existing');
    }
  };

  const handleBuyPriceChange = (newBuyPrice: number) => {
    setBuyPrice(newBuyPrice);
    // Suggest retail and wholesale prices if user hasn't explicitly customized
    if (retailPrice === 0 || retailPrice === Math.round(buyPrice * 1.3)) {
      setRetailPrice(Math.round(newBuyPrice * 1.3));
    }
    if (wholesalePrice1 === 0 || wholesalePrice1 === Math.round(buyPrice * 1.25)) {
      setWholesalePrice1(Math.round(newBuyPrice * 1.25));
    }
    if (wholesalePrice2 === 0 || wholesalePrice2 === Math.round(buyPrice * 1.2)) {
      setWholesalePrice2(Math.round(newBuyPrice * 1.2));
    }
    if (wholesalePrice3 === 0 || wholesalePrice3 === Math.round(buyPrice * 1.15)) {
      setWholesalePrice3(Math.round(newBuyPrice * 1.15));
    }
  };

  const handleResetForm = () => {
    setBarcode(`SQ${Math.floor(100 + Math.random() * 900)}`);
    setItemName('');
    setCategory('SHIRT');
    setUnit('ထည်');
    setQty(50);
    setBuyPrice(20000);
    setRetailPrice(26000);
    setWholesalePrice1(25000);
    setWholesalePrice2(24000);
    setWholesalePrice3(23000);
    setImageUrl('');
    setEntryMode('new_custom');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim() || !itemName.trim() || qty <= 0 || buyPrice <= 0) {
      alert('ကျေးဇူးပြု၍ Barcode၊ ပစ္စည်းအမည်၊ အရေအတွက်နှင့် ဝယ်ဈေးနှုန်းတို့ကို ပြည့်စုံစွာ ဖြည့်သွင်းပါ');
      return;
    }

    const today = new Date();
    const formattedDate = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(
      today.getDate()
    ).padStart(2, '0')}/${today.getFullYear()}`;
    const voucherNo = `p.${formattedDate}.E.${purchases.length + 1}`;
    const totalAmount = qty * buyPrice;
    const finalSupplier = customSupplier.trim() || supplier;

    addPurchaseRecord(
      {
        date: formattedDate,
        voucherNo,
        barcode: barcode.trim(),
        itemName: itemName.trim(),
        category: category.trim() || 'SHIRT',
        qty,
        unit: unit.trim() || 'ထည်',
        buyPrice,
        totalAmount,
        store: selectedStore,
        supplier: finalSupplier,
        paymentMethod,
      },
      {
        retailPrice: retailPrice || Math.round(buyPrice * 1.3),
        wholesalePrice1: wholesalePrice1 || Math.round(buyPrice * 1.25),
        wholesalePrice2: wholesalePrice2 || Math.round(buyPrice * 1.2),
        wholesalePrice3: wholesalePrice3 || Math.round(buyPrice * 1.15),
        imageUrl: imageUrl.trim() || undefined,
        supplier: finalSupplier,
      }
    );

    setSuccessMessage(`"${itemName}" အဝယ်စာရင်း (${qty} ${unit}) အောင်မြင်စွာ မှတ်တမ်းတင်ပြီးပါပြီ!`);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3500);

    handleResetForm();
  };

  return (
    <div
      id="purchase-entry-view"
      className="flex-1 flex flex-col md:flex-row h-full bg-[#f8f9fa] overflow-y-auto select-none pb-20 md:pb-0"
    >
      {/* Left Area: Purchase Voucher Entry Form */}
      <div className="w-full md:w-[460px] lg:w-[480px] bg-white border-b md:border-b-0 md:border-r border-gray-300 p-4 md:p-5 shrink-0 flex flex-col justify-between overflow-y-auto shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="flex items-center justify-between border-b pb-2 mb-1">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-[#ff6600]" />
              <h2 className="font-bold text-sm text-gray-900">
                အဝယ်စာရင်း / ပစ္စည်းအသစ် ထည့်သွင်းရန်
              </h2>
            </div>
            <button
              type="button"
              onClick={handleResetForm}
              className="text-[11px] text-gray-500 hover:text-[#ff6600] flex items-center gap-1 cursor-pointer"
              title="အသစ်ပြန်စရန်"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>အသစ်</span>
            </button>
          </div>

          {/* Mode Selector Tabs (ရှိပြီးသားမှရွေး သို့မဟုတ် အသစ်ရေးထည့်) */}
          <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setEntryMode('new_custom')}
              className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                entryMode === 'new_custom'
                  ? 'bg-[#ff6600] text-white shadow-xs'
                  : 'text-gray-700 hover:bg-white/60'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ပစ္စည်းအသစ် စိတ်ကြိုက်ထည့်မည်</span>
            </button>

            <button
              type="button"
              onClick={() => setEntryMode('existing')}
              className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                entryMode === 'existing'
                  ? 'bg-gray-800 text-white shadow-xs'
                  : 'text-gray-700 hover:bg-white/60'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>ရှိပြီးသားထဲမှ ရွေးမည်</span>
            </button>
          </div>

          {/* Quick Select from Existing Products if in existing mode or available */}
          {entryMode === 'existing' && (
            <div className="bg-orange-50/60 p-2.5 rounded-xl border border-orange-200 animate-in fade-in">
              <label className="block font-bold text-gray-800 mb-1">
                ရှိပြီးသား ကုန်ပစ္စည်း စာရင်းမှ ရွေးချယ်ပါ:
              </label>
              <select
                onChange={(e) => handleProductSelect(e.target.value)}
                value={barcode}
                className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs text-gray-800 focus:outline-none focus:border-[#ff6600]"
              >
                <option value="">-- ပစ္စည်း ရွေးချယ်ပါ --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.barcode}>
                    {p.barcode} - {p.name} ({p.category}) [လက်ကျန်: {p.stockQty} {p.unit}]
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Barcode & Category with Quick Presets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Barcode / Code နံပါတ်:
              </label>
              <input
                type="text"
                required
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="ဥပမာ: SQ001"
                className="w-full bg-white border border-gray-300 rounded-lg p-2 font-mono font-bold text-gray-900 focus:outline-none focus:border-[#ff6600]"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                အမျိုးအစား (Category):
              </label>
              <input
                type="text"
                required
                list="category-suggestions"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="SHIRT, Tshirt, card..."
                className="w-full bg-white border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-[#ff6600]"
              />
              <datalist id="category-suggestions">
                {commonCategories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Category Quick Chips */}
          <div className="flex items-center space-x-1 overflow-x-auto py-0.5 scrollbar-none">
            {commonCategories.slice(0, 6).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`text-[10px] px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  category === cat
                    ? 'bg-gray-800 text-white font-bold'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Name (စိတ်ကြိုက် ရေးသားနိုင်ခြင်း) */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              ပစ္စည်းအမည် (Product Name):
            </label>
            <input
              type="text"
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="ဥပမာ: SOlo Shirt (White/L)"
              className="w-full bg-white border border-gray-300 rounded-lg p-2 font-medium text-gray-900 text-xs focus:outline-none focus:border-[#ff6600]"
            />
          </div>

          {/* PRODUCT IMAGE PICKER / UPLOADER (ပစ္စည်းပုံ ထည့်သွင်းရန်) */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
            <ProductImagePicker
              imageUrl={imageUrl}
              onChange={(url) => setImageUrl(url)}
              category={category}
            />
          </div>

          {/* Qty & Unit with Quick Presets */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-gray-700 mb-1 flex items-center justify-between">
                  <span>အဝယ်အရေအတွက် (Qty):</span>
                  <span className="text-[10px] text-gray-400 font-normal">စိတ်ကြိုက်ရိုက်ထည့်ပါ</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={qty === 0 ? '' : qty}
                  onChange={(e) => setQty(parseCleanNumber(e.target.value))}
                  onBlur={() => { if (!qty || qty < 1) setQty(1); }}
                  placeholder="အရေအတွက်..."
                  className="w-full bg-white border border-gray-300 rounded-lg p-2 font-mono font-bold text-gray-900 focus:outline-none focus:border-[#ff6600]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  ယူနစ် (Unit):
                </label>
                <input
                  type="text"
                  required
                  list="unit-suggestions"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="ထည်, ခု, ဘူး, card..."
                  className="w-full bg-white border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-[#ff6600]"
                />
                <datalist id="unit-suggestions">
                  {commonUnits.map((u) => (
                    <option key={u} value={u} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Quick Quantity Presets (5, 10, 20, 50, 100) */}
            <div className="flex items-center space-x-1.5 pt-0.5 overflow-x-auto scrollbar-none">
              <span className="text-[10px] text-gray-500 font-medium shrink-0">အမြန်ရွေးရန်:</span>
              {[5, 10, 20, 50, 100, 200].map((presetQty) => (
                <button
                  key={presetQty}
                  type="button"
                  onClick={() => setQty(presetQty)}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                    qty === presetQty
                      ? 'bg-[#ff6600] text-white shadow-2xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                  }`}
                >
                  {presetQty} {unit}
                </button>
              ))}
            </div>
          </div>

          {/* Buy Price & Total Payable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-gray-700 mb-1 flex items-center justify-between">
                <span>လက်ကားဝယ်ရင်းဈေး (Buy Price):</span>
                <span className="text-[10px] text-[#ff6600] font-semibold">1 ခုလျှင်</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={buyPrice === 0 ? '' : buyPrice}
                onChange={(e) => handleBuyPriceChange(parseCleanNumber(e.target.value))}
                placeholder="ဝယ်ရင်းဈေး..."
                className="w-full bg-white border border-gray-300 rounded-lg p-2 font-mono font-bold text-gray-900 focus:outline-none focus:border-[#ff6600]"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                ကျသင့်ငွေ စုစုပေါင်း:
              </label>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 font-mono font-bold text-[#ff6600] text-sm flex items-center justify-between">
                <span>{(qty * buyPrice).toLocaleString()}</span>
                <span className="text-xs">Ks</span>
              </div>
            </div>
          </div>

          {/* Selling Price Fields (လက်လီရောင်းဈေး / လက်ကား ၅ထည် / ၁၀ထည် / ၂၀ထည်) */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <span className="font-bold text-gray-800 block text-[11px]">
              အရောင်းဈေးနှုန်းများ သတ်မှတ်ရန် (Selling Prices):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <div>
                <label className="block text-[10px] text-orange-700 font-bold mb-0.5">လက်လီရောင်းဈေး:</label>
                <input
                  type="number"
                  value={retailPrice === 0 ? '' : retailPrice}
                  onChange={(e) => setRetailPrice(parseCleanNumber(e.target.value))}
                  placeholder="26000"
                  className="w-full bg-white border border-gray-300 rounded p-1.5 font-mono text-xs font-semibold focus:outline-none focus:border-[#ff6600]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-blue-700 font-bold mb-0.5">လက်ကား (၅ ထည်):</label>
                <input
                  type="number"
                  value={wholesalePrice1 === 0 ? '' : wholesalePrice1}
                  onChange={(e) => setWholesalePrice1(parseCleanNumber(e.target.value))}
                  placeholder="25000"
                  className="w-full bg-white border border-gray-300 rounded p-1.5 font-mono text-xs font-semibold focus:outline-none focus:border-[#ff6600]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-purple-700 font-bold mb-0.5">လက်ကား (၁၀ ထည်):</label>
                <input
                  type="number"
                  value={wholesalePrice2 === 0 ? '' : wholesalePrice2}
                  onChange={(e) => setWholesalePrice2(parseCleanNumber(e.target.value))}
                  placeholder="24000"
                  className="w-full bg-white border border-gray-300 rounded p-1.5 font-mono text-xs font-semibold focus:outline-none focus:border-[#ff6600]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-emerald-700 font-bold mb-0.5">လက်ကား (၂၀ ထည်):</label>
                <input
                  type="number"
                  value={wholesalePrice3 === 0 ? '' : wholesalePrice3}
                  onChange={(e) => setWholesalePrice3(parseCleanNumber(e.target.value))}
                  placeholder="23000"
                  className="w-full bg-white border border-gray-300 rounded p-1.5 font-mono text-xs font-semibold focus:outline-none focus:border-[#ff6600]"
                />
              </div>
            </div>
          </div>

          {/* Supplier & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                ကုန်သွင်းသူ (Supplier):
              </label>
              <div className="space-y-1">
                <select
                  value={supplier}
                  onChange={(e) => {
                    setSupplier(e.target.value);
                    if (e.target.value !== '__custom__') {
                      setCustomSupplier('');
                    }
                  }}
                  className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs text-gray-800 focus:outline-none focus:border-[#ff6600]"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                  <option value="__custom__">+ စိတ်ကြိုက် ကုန်သွင်းသူအမည် ရေးမည်</option>
                </select>

                {supplier === '__custom__' && (
                  <input
                    type="text"
                    required
                    value={customSupplier}
                    onChange={(e) => setCustomSupplier(e.target.value)}
                    placeholder="ကုန်သွင်းသူ ကုမ္ပဏီ/ဆိုင် အမည်ရိုက်ပါ..."
                    className="w-full bg-white border border-gray-300 rounded-lg p-1.5 text-xs focus:outline-none focus:border-[#ff6600] animate-in fade-in"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                ငွေပေးချေမှု ပုံစံ:
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs text-gray-800 focus:outline-none focus:border-[#ff6600]"
              >
                <option value="Cash">Cash (ငွေသားပေးချေ)</option>
                <option value="Bank">Bank / Mobile Transfer</option>
                <option value="Credit">Credit (အကြွေးဝယ်)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#ff6600] hover:bg-[#e65c00] text-white font-black py-3 rounded-xl shadow-md cursor-pointer flex items-center justify-center space-x-2 mt-4 active:scale-98 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>အဝယ်စာရင်း & ပစ္စည်း ထည့်သွင်းမည်</span>
          </button>
        </form>

        {isSuccess && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-center space-x-2 text-xs font-bold animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* Right Area: Recent Stock In Purchases List with Product Photos */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-3 md:p-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs flex-1 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-gray-700" />
              <h3 className="font-bold text-xs text-gray-900">
                မကြာသေးမီက ဝယ်ယူသွင်းထားသော စာရင်းများ ({purchases.length} ခု)
              </h3>
            </div>
            <div className="text-xs font-bold text-[#ff6600] font-mono">
              စုစုပေါင်း: {purchases.reduce((s, p) => s + p.totalAmount, 0).toLocaleString()} Ks
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[780px]">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-bold border-b">
                  <th className="p-2.5 border-r text-center">စဉ်</th>
                  <th className="p-2.5 border-r text-center">ပုံ</th>
                  <th className="p-2.5 border-r">ရက်စွဲ</th>
                  <th className="p-2.5 border-r">ဘောက်ချာ</th>
                  <th className="p-2.5 border-r">Barcode</th>
                  <th className="p-2.5 border-r">အမည်</th>
                  <th className="p-2.5 border-r">အမျိုးအစား</th>
                  <th className="p-2.5 border-r text-right">အရေအတွက်</th>
                  <th className="p-2.5 border-r text-right">ဝယ်ဈေးနှုန်း</th>
                  <th className="p-2.5 border-r text-right">ကျသင့်ငွေ</th>
                  <th className="p-2.5">ကုန်သွင်းသူ</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p, idx) => {
                  const matchedProd = products.find((prod) => prod.barcode === p.barcode);
                  const photo = matchedProd?.imageUrl;

                  return (
                    <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-2.5 text-center text-gray-500">{idx + 1}</td>
                      <td className="p-2 text-center">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden mx-auto flex items-center justify-center">
                          {photo ? (
                            <img
                              src={photo}
                              alt={p.itemName}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="p-2.5 font-mono text-gray-800">{p.date}</td>
                      <td className="p-2.5 font-mono text-gray-800">{p.voucherNo}</td>
                      <td className="p-2.5 font-mono font-medium text-gray-900">{p.barcode}</td>
                      <td className="p-2.5 font-bold text-gray-900">{p.itemName}</td>
                      <td className="p-2.5 text-gray-600">{p.category}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-gray-900">
                        {p.qty.toFixed(0)} {p.unit}
                      </td>
                      <td className="p-2.5 text-right font-mono">{p.buyPrice.toLocaleString()}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-gray-900">
                        {p.totalAmount.toLocaleString()} Ks
                      </td>
                      <td className="p-2.5 text-gray-700 font-medium">{p.supplier}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
