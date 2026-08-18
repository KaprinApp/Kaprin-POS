import React, { useState } from 'react';
import { ShoppingBag, Plus, Barcode, CheckCircle, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';

export const PurchaseEntryView: React.FC = () => {
  const {
    products,
    suppliers,
    selectedStore,
    addPurchaseRecord,
    purchases,
  } = useApp();

  const [barcode, setBarcode] = useState('');
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('SHIRT');
  const [unit, setUnit] = useState('ထည်');
  const [qty, setQty] = useState<number>(100);
  const [buyPrice, setBuyPrice] = useState<number>(20000);
  const [supplier, setSupplier] = useState(suppliers[0]?.name || 'Royal Supply');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleProductSelect = (selectedBarcode: string) => {
    setBarcode(selectedBarcode);
    const matched = products.find((p) => p.barcode === selectedBarcode);
    if (matched) {
      setItemName(matched.name);
      setCategory(matched.category);
      setUnit(matched.unit);
      setBuyPrice(matched.buyPrice);
      setSupplier(matched.supplier || suppliers[0]?.name || '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode || !itemName || qty <= 0 || buyPrice <= 0) {
      alert('ကျေးဇူးပြု၍ လိုအပ်သောအချက်အလက်များကို ပြည့်စုံစွာ ဖြည့်သွင်းပါ');
      return;
    }

    const voucherNo = `p.08/14/2026.E.${purchases.length + 1}`;
    const totalAmount = qty * buyPrice;

    addPurchaseRecord({
      date: '08/14/2026',
      voucherNo,
      barcode,
      itemName,
      category,
      qty,
      unit,
      buyPrice,
      totalAmount,
      store: selectedStore,
      supplier,
      paymentMethod,
    });

    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);

    // Reset form
    setBarcode('');
    setItemName('');
    setQty(100);
  };

  return (
    <div id="purchase-entry-view" className="flex-1 flex flex-col md:flex-row h-full bg-[#f8f9fa] overflow-y-auto select-none pb-20 md:pb-0">
      {/* Left Area: Purchase Voucher Entry Form */}
      <div className="w-full md:w-[420px] bg-white border-b md:border-b-0 md:border-r border-gray-300 p-4 md:p-5 shrink-0 flex flex-col justify-between overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="flex items-center space-x-2 border-b pb-2 mb-2">
            <ShoppingBag className="w-5 h-5 text-[#ff6600]" />
            <h2 className="font-bold text-sm text-gray-900">အဝယ်ဘောက်ချာ ထည့်သွင်းရန် (Stock In)</h2>
          </div>

          {/* Existing Product Quick Fill */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">ရှိပြီးသား ပစ္စည်းမှ ရွေးချယ်ရန်:</label>
            <select
              onChange={(e) => handleProductSelect(e.target.value)}
              value={barcode}
              className="w-full bg-gray-50 border border-gray-300 rounded p-1.5 text-xs text-gray-800 focus:outline-none focus:border-[#ff6600]"
            >
              <option value="">-- ပစ္စည်းအသစ် ထည့်သွင်းမည် --</option>
              {products.map((p) => (
                <option key={p.id} value={p.barcode}>
                  {p.barcode} - {p.name} ({p.category}) [လက်ကျန်: {p.stockQty} {p.unit}]
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Barcode / Code:</label>
              <input
                type="text"
                required
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="ဥပမာ: SQ001"
                className="w-full bg-white border border-gray-300 rounded p-1.5 font-mono font-medium focus:outline-none focus:border-[#ff6600]"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">အမျိုးအစား:</label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="SHIRT, Tshirt, card..."
                className="w-full bg-white border border-gray-300 rounded p-1.5 focus:outline-none focus:border-[#ff6600]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">ပစ္စည်းအမည်:</label>
            <input
              type="text"
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="ဥပမာ: SOlo Shirt"
              className="w-full bg-white border border-gray-300 rounded p-1.5 font-medium focus:outline-none focus:border-[#ff6600]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">အဝယ်အရေအတွက် (Qty):</label>
              <input
                type="number"
                required
                min="1"
                value={qty}
                onChange={(e) => setQty(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-gray-300 rounded p-1.5 font-mono font-bold focus:outline-none focus:border-[#ff6600]"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">ယူနစ် (Unit):</label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="ထည်, ခု, card..."
                className="w-full bg-white border border-gray-300 rounded p-1.5 focus:outline-none focus:border-[#ff6600]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">ဝယ်ဈေးနှုန်း (Unit Buy Price):</label>
              <input
                type="number"
                required
                min="0"
                value={buyPrice}
                onChange={(e) => setBuyPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-gray-300 rounded p-1.5 font-mono font-bold focus:outline-none focus:border-[#ff6600]"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">ကျသင့်ငွေ (Total Amount):</label>
              <div className="bg-gray-100 border border-gray-300 rounded p-1.5 font-mono font-bold text-gray-900">
                {(qty * buyPrice).toLocaleString()} Ks
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">ကုန်သွင်းသူ (Supplier):</label>
            <select
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded p-1.5 text-gray-800 focus:outline-none focus:border-[#ff6600]"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">ငွေပေးချေမှု ပုံစံ:</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full bg-white border border-gray-300 rounded p-1.5 text-gray-800 focus:outline-none focus:border-[#ff6600]"
            >
              <option value="Cash">Cash (ငွေသားပေးချေ)</option>
              <option value="Bank">Bank / Mobile Transfer</option>
              <option value="Credit">Credit (အကြွေးဝယ်)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-[#ff6600] hover:bg-[#e65c00] text-white font-bold py-2.5 rounded shadow-xs cursor-pointer flex items-center justify-center space-x-1.5 mt-4"
          >
            <Plus className="w-4 h-4" />
            <span>အဝယ်စာရင်း ထည့်သွင်းမည်</span>
          </button>
        </form>

        {isSuccess && (
          <div className="mt-3 p-2 bg-green-50 border border-green-200 text-green-800 rounded flex items-center space-x-2 text-xs font-semibold animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
            <span>အဝယ်စာရင်း အောင်မြင်စွာ မှတ်တမ်းတင်ပြီးပါပြီ!</span>
          </div>
        )}
      </div>

      {/* Right Area: Recent Stock In Purchases List */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-3 md:p-4">
        <div className="bg-white rounded border border-gray-200 shadow-xs flex-1 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-gray-600" />
              <h3 className="font-bold text-xs text-gray-800">မကြာသေးမီက ဝယ်ယူသွင်းထားသော စာရင်းများ</h3>
            </div>
            <div className="text-xs text-gray-500 font-mono">
              Total: {purchases.reduce((s, p) => s + p.totalAmount, 0).toLocaleString()} Ks
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-gray-200 text-gray-700 font-bold border-b">
                  <th className="p-2 border-r text-center">စဉ်</th>
                  <th className="p-2 border-r">ရက်စွဲ</th>
                  <th className="p-2 border-r">ဘောက်ချာ</th>
                  <th className="p-2 border-r">Barcode</th>
                  <th className="p-2 border-r">အမည်</th>
                  <th className="p-2 border-r">အမျိုးအစား</th>
                  <th className="p-2 border-r text-right">အရေအတွက်</th>
                  <th className="p-2 border-r text-right">ဝယ်ဈေးနှုန်း</th>
                  <th className="p-2 border-r text-right">ကျသင့်ငွေ</th>
                  <th className="p-2">ကုန်သွင်းသူ</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p, idx) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-2 text-center text-gray-500">{idx + 1}</td>
                    <td className="p-2 font-mono text-gray-800">{p.date}</td>
                    <td className="p-2 font-mono text-gray-800">{p.voucherNo}</td>
                    <td className="p-2 font-mono font-medium text-gray-900">{p.barcode}</td>
                    <td className="p-2 font-medium text-gray-900">{p.itemName}</td>
                    <td className="p-2 text-gray-600">{p.category}</td>
                    <td className="p-2 text-right font-mono font-bold text-gray-900">{p.qty.toFixed(2)} {p.unit}</td>
                    <td className="p-2 text-right font-mono">{p.buyPrice.toLocaleString()}</td>
                    <td className="p-2 text-right font-mono font-bold text-gray-900">{p.totalAmount.toLocaleString()} Ks</td>
                    <td className="p-2 text-gray-700 font-medium">{p.supplier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
