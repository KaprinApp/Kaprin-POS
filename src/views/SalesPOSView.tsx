import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Barcode,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  Clock,
  Printer,
  Check,
  User,
  ShoppingBag,
  RotateCcw,
  Camera,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, CartItem, SaleType, PaymentMethod } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';

export const SalesPOSView: React.FC = () => {
  const {
    products,
    customers,
    activeStaff,
    selectedStore,
    addMultipleSaleRecords,
    settings,
  } = useApp();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'catalog' | 'cart'>('catalog');
  const [cameraScannerOpen, setCameraScannerOpen] = useState(false);

  const [lastCompletedSale, setLastCompletedSale] = useState<{
    voucherNo: string;
    items: CartItem[];
    paymentMethod: PaymentMethod;
    totalAmount: number;
    cashTendered: number;
    changeAmount: number;
    customerName: string;
    date: string;
  } | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Auto focus barcode input on desktop
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  const categories = ['All', 'SHIRT', 'Tshirt', 'card', 'PANTS', 'ACCESSORIES'];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
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

  const handleAddToCart = (product: Product, priceType: SaleType = 'လက်လီ') => {
    let unitPrice = product.retailPrice;
    if (priceType === 'လက်ကား ၁') unitPrice = product.wholesalePrice1;
    if (priceType === 'လက်ကား ၂') unitPrice = product.wholesalePrice2;

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedPriceType === priceType
      );
      if (existingIdx !== -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].qty + 1;
        updated[existingIdx] = {
          ...updated[existingIdx],
          qty: newQty,
          total: newQty * updated[existingIdx].unitPrice - updated[existingIdx].discount,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            product,
            qty: 1,
            selectedPriceType: priceType,
            unitPrice,
            discount: 0,
            total: unitPrice,
          },
        ];
      }
    });
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matched = products.find(
      (p) => p.barcode.toLowerCase() === barcodeInput.trim().toLowerCase()
    );

    if (matched) {
      handleAddToCart(matched, 'လက်လီ');
      setBarcodeInput('');
    } else {
      alert(`Barcode "${barcodeInput}" ဖြင့် ပစ္စည်း ရှာမတွေ့ပါ!`);
      setBarcodeInput('');
    }
  };

  const updateCartQty = (idx: number, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(idx);
      return;
    }
    setCart((prev) => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        qty: newQty,
        total: newQty * updated[idx].unitPrice - updated[idx].discount,
      };
      return updated;
    });
  };

  const updatePriceType = (idx: number, type: SaleType) => {
    setCart((prev) => {
      const updated = [...prev];
      const prod = updated[idx].product;
      let price = prod.retailPrice;
      if (type === 'လက်ကား ၁') price = prod.wholesalePrice1;
      if (type === 'လက်ကား ၂') price = prod.wholesalePrice2;

      updated[idx] = {
        ...updated[idx],
        selectedPriceType: type,
        unitPrice: price,
        total: updated[idx].qty * price - updated[idx].discount,
      };
      return updated;
    });
  };

  const removeFromCart = (idx: number) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalCartQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalCartAmount = cart.reduce((sum, item) => sum + item.total, 0);
  const totalCartDiscount = cart.reduce((sum, item) => sum + item.discount, 0);

  const handleOpenPayment = () => {
    if (cart.length === 0) return;
    setCashTendered(totalCartAmount);
    setPaymentModalOpen(true);
  };

  const handleCompleteSale = () => {
    const voucherNo = `08/14/2026.E.${Math.floor(10000 + Math.random() * 90000)}`;
    const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

    const saleRecords = cart.map((item) => {
      const grossProfit =
        (item.unitPrice - item.product.buyPrice) * item.qty - item.discount;

      return {
        date: '08/14/2026',
        voucherNo,
        barcode: item.product.barcode,
        itemName: item.product.name,
        category: item.product.category,
        qty: item.qty,
        unit: item.product.unit,
        unitPrice: item.unitPrice,
        discount: item.discount,
        totalAmount: item.total,
        grossProfit: Math.max(0, grossProfit),
        saleType: item.selectedPriceType,
        store: selectedStore,
        cashier: activeStaff?.name || 'Admin',
        paymentMethod,
        customerId: selectedCustomerId || undefined,
        customerName: selectedCustomer ? selectedCustomer.name : undefined,
      };
    });

    addMultipleSaleRecords(saleRecords);

    setLastCompletedSale({
      voucherNo,
      items: [...cart],
      paymentMethod,
      totalAmount: totalCartAmount,
      cashTendered: paymentMethod === 'Cash' ? cashTendered : totalCartAmount,
      changeAmount:
        paymentMethod === 'Cash' ? Math.max(0, cashTendered - totalCartAmount) : 0,
      customerName: selectedCustomer ? selectedCustomer.name : 'General Customer (လက်လီဖောက်သည်)',
      date: '08/14/2026',
    });

    setPaymentModalOpen(false);
    setCart([]);
    setReceiptModalOpen(true);
  };

  return (
    <div id="sales-pos-terminal" className="flex-1 flex flex-col md:flex-row h-full bg-[#f8f9fa] overflow-hidden select-none pb-12 md:pb-0">
      {/* Mobile Top View Switcher */}
      <div className="md:hidden flex items-center bg-white border-b border-gray-200 p-1.5 shrink-0 justify-around">
        <button
          onClick={() => setMobileTab('catalog')}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded flex items-center justify-center space-x-1.5 transition-colors ${
            mobileTab === 'catalog'
              ? 'bg-[#ff6600] text-white shadow-xs'
              : 'text-gray-600 bg-gray-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>ပစ္စည်းများ (Catalog)</span>
        </button>
        <button
          onClick={() => setMobileTab('cart')}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded flex items-center justify-center space-x-1.5 transition-colors ml-1.5 ${
            mobileTab === 'cart'
              ? 'bg-[#ff6600] text-white shadow-xs'
              : 'text-gray-600 bg-gray-100'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>ခြင်းတောင်း ({cart.length})</span>
          {cart.length > 0 && (
            <span className="bg-white text-[#ff6600] text-[10px] px-1 rounded-full font-mono ml-0.5">
              {totalCartAmount.toLocaleString()} Ks
            </span>
          )}
        </button>
      </div>

      {/* Left Area: Product Selector & Barcode Scanner */}
      <div
        className={`flex-1 flex flex-col border-r border-gray-300 p-2 md:p-3 overflow-hidden ${
          mobileTab === 'cart' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Barcode & Search Controls */}
        <div className="bg-white p-2.5 md:p-3 rounded border border-gray-200 shadow-xs mb-2 md:mb-3 space-y-2 shrink-0">
          <form onSubmit={handleBarcodeSubmit} className="flex items-center space-x-1.5 md:space-x-2">
            <div className="relative flex-1">
              <input
                ref={barcodeInputRef}
                id="pos-barcode-input"
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Barcode ရိုက်ထည့်ပါ..."
                className="w-full bg-gray-50 border border-gray-300 rounded px-2.5 py-1.5 md:py-2 pl-8 font-mono text-xs md:text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#ff6600]"
              />
              <Barcode className="w-4 h-4 text-gray-500 absolute left-2 top-2 md:top-2.5" />
            </div>

            {/* Camera Barcode Trigger for Mobile */}
            <button
              type="button"
              onClick={() => setCameraScannerOpen(true)}
              className="p-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 rounded cursor-pointer"
              title="Camera Barcode Scanner"
            >
              <Camera className="w-4 h-4 text-gray-800" />
            </button>

            <button
              type="submit"
              className="bg-[#ff6600] hover:bg-[#e65c00] text-white text-xs font-bold px-3 py-1.5 md:py-2 rounded shadow-xs cursor-pointer shrink-0"
            >
              Scan
            </button>
          </form>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-1.5 sm:space-y-0 sm:space-x-2">
            <div className="relative flex-1">
              <input
                id="pos-product-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ပစ္စည်းအမည်ဖြင့် ရှာရန်..."
                className="w-full bg-gray-50 border border-gray-300 rounded px-2.5 py-1 pl-7 text-xs text-gray-800 focus:bg-white focus:outline-none focus:border-[#ff6600]"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1.5" />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center space-x-1 overflow-x-auto py-0.5 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[11px] px-2 py-0.5 rounded transition-colors whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#545b62] text-white font-bold'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'All' ? 'အားလုံး' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Catalog Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pr-0.5">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              onClick={() => handleAddToCart(prod, 'လက်လီ')}
              className="bg-white border border-gray-200 hover:border-[#ff6600] active:scale-98 rounded p-2 flex flex-col justify-between shadow-xs hover:shadow-md cursor-pointer transition-all group"
            >
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[9px] bg-gray-100 text-gray-600 px-1 py-0.5 rounded font-mono">
                    {prod.barcode}
                  </span>
                  <span
                    className={`text-[9px] px-1 py-0.5 rounded font-semibold ${
                      prod.stockQty > 10
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {prod.stockQty} {prod.unit}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-gray-900 line-clamp-1 group-hover:text-[#ff6600]">
                  {prod.name}
                </h4>
                <div className="text-[10px] text-gray-500">{prod.category}</div>
              </div>

              <div className="mt-2 pt-1.5 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-[9px] text-gray-400">လက်လီဈေး</div>
                  <div className="font-bold text-xs text-gray-900 font-mono">
                    {prod.retailPrice.toLocaleString()} Ks
                  </div>
                </div>
                <button className="w-6 h-6 rounded-full bg-orange-50 group-hover:bg-[#ff6600] text-[#ff6600] group-hover:text-white flex items-center justify-center transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Floating Cart Summary Button (when on catalog tab) */}
        {cart.length > 0 && (
          <div className="md:hidden mt-2 pt-1">
            <button
              onClick={() => setMobileTab('cart')}
              className="w-full bg-[#ff6600] text-white font-bold text-xs py-2.5 px-3 rounded-lg shadow flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center space-x-1.5">
                <ShoppingBag className="w-4 h-4" />
                <span>ခြင်းတောင်း ({cart.length} မျိုး)</span>
              </div>
              <span className="font-mono text-sm">{totalCartAmount.toLocaleString()} Ks →</span>
            </button>
          </div>
        )}
      </div>

      {/* Right Area: Checkout Cart & Voucher Slip */}
      <div
        className={`w-full md:w-96 lg:w-[400px] bg-white flex flex-col h-full shadow-lg shrink-0 ${
          mobileTab === 'catalog' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Cart Header */}
        <div className="p-2.5 md:p-3 bg-gray-100 border-b border-gray-300 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-4 h-4 text-[#ff6600]" />
            <h3 className="font-bold text-xs md:text-sm text-gray-900">အရောင်းဘောက်ချာ (Cart)</h3>
          </div>
          <button
            onClick={clearCart}
            disabled={cart.length === 0}
            className="text-xs text-gray-500 hover:text-red-600 disabled:opacity-30 flex items-center space-x-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ဖျက်ရန်</span>
          </button>
        </div>

        {/* Customer Selector */}
        <div className="p-2 bg-gray-50 border-b border-gray-200 shrink-0">
          <div className="flex items-center space-x-1.5 text-xs">
            <User className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-800 focus:outline-none focus:border-[#ff6600]"
            >
              <option value="">လက်လီဝယ်ယူသူ (Retail Customer)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (ကြွေးကျန်: {c.creditBalance.toLocaleString()} Ks)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 py-8">
              <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
              <p className="text-xs">ဘောက်ချာတွင် ပစ္စည်းများ မရှိသေးပါ</p>
              <button
                onClick={() => setMobileTab('catalog')}
                className="md:hidden text-xs text-[#ff6600] font-semibold underline"
              >
                ပစ္စည်းများ ရွေးချယ်ရန် သွားပါ
              </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={`${item.product.id}-${item.selectedPriceType}`}
                className="bg-gray-50 border border-gray-200 rounded p-2 text-xs space-y-1.5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-gray-900">{item.product.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono">{item.product.barcode}</div>
                  </div>
                  <button
                    onClick={() => removeFromCart(idx)}
                    className="text-gray-400 hover:text-red-600 p-0.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Price Type & Unit Price */}
                <div className="flex items-center justify-between text-[11px]">
                  <select
                    value={item.selectedPriceType}
                    onChange={(e) => updatePriceType(idx, e.target.value as SaleType)}
                    className="bg-white border border-gray-300 rounded px-1.5 py-0.5 text-gray-700 text-[11px] focus:outline-none"
                  >
                    <option value="လက်လီ">လက်လီ</option>
                    <option value="လက်ကား ၁">လက်ကား ၁</option>
                    <option value="လက်ကား ၂">လက်ကား ၂</option>
                  </select>
                  <span className="font-mono font-semibold text-gray-800">
                    {item.unitPrice.toLocaleString()} Ks
                  </span>
                </div>

                {/* Qty & Subtotal Controls */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                  <div className="flex items-center space-x-1 bg-white border border-gray-300 rounded p-0.5">
                    <button
                      onClick={() => updateCartQty(idx, item.qty - 1)}
                      className="w-5 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-xs cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateCartQty(idx, parseFloat(e.target.value) || 1)}
                      className="w-10 text-center font-mono font-bold text-xs bg-transparent focus:outline-none"
                    />
                    <button
                      onClick={() => updateCartQty(idx, item.qty + 1)}
                      className="w-5 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-xs cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-xs md:text-sm text-gray-900 font-mono">
                      {item.total.toLocaleString()} Ks
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary & Pay Actions */}
        <div className="p-2.5 md:p-3 bg-gray-100 border-t border-gray-300 space-y-1.5 shrink-0">
          <div className="flex justify-between text-xs text-gray-600">
            <span>စုစုပေါင်း အရေအတွက် (Qty):</span>
            <span className="font-mono font-bold text-gray-900">{totalCartQty.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center text-xs md:text-sm font-bold text-gray-900 pt-1 border-t border-gray-300">
            <span>ကျသင့်ငွေ စုစုပေါင်း:</span>
            <span className="text-base md:text-lg font-mono font-black text-[#ff6600]">
              {totalCartAmount.toLocaleString()} Ks
            </span>
          </div>

          {/* Quick Pay Buttons */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              id="btn-pay-cash"
              disabled={cart.length === 0}
              onClick={() => {
                setPaymentMethod('Cash');
                handleOpenPayment();
              }}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold py-2 md:py-2.5 rounded shadow-xs flex flex-col items-center justify-center cursor-pointer"
            >
              <Banknote className="w-3.5 h-3.5 md:w-4 md:h-4 mb-0.5" />
              <span>Cash (ငွေသား)</span>
            </button>

            <button
              id="btn-pay-bank"
              disabled={cart.length === 0}
              onClick={() => {
                setPaymentMethod('Bank');
                handleOpenPayment();
              }}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold py-2 md:py-2.5 rounded shadow-xs flex flex-col items-center justify-center cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 md:w-4 md:h-4 mb-0.5" />
              <span>KPay / Bank</span>
            </button>

            <button
              id="btn-pay-credit"
              disabled={cart.length === 0}
              onClick={() => {
                setPaymentMethod('Credit');
                handleOpenPayment();
              }}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-bold py-2 md:py-2.5 rounded shadow-xs flex flex-col items-center justify-center cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 mb-0.5" />
              <span>အကြွေးရောင်း</span>
            </button>
          </div>
        </div>
      </div>

      {/* Camera Barcode Scanner Simulator Modal */}
      {cameraScannerOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 max-w-sm w-full shadow-2xl text-center space-y-3">
            <h3 className="font-bold text-sm text-gray-900 flex items-center justify-center gap-1.5">
              <Camera className="w-4 h-4 text-[#ff6600]" />
              <span>Mobile Camera Barcode Scan</span>
            </h3>

            <div className="relative bg-black rounded-lg aspect-4/3 flex items-center justify-center overflow-hidden border-2 border-dashed border-[#ff6600]">
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-red-500 animate-pulse shadow-md"></div>
              <p className="text-white text-xs px-4">ပစ္စည်း Barcode ကို ကင်မရာရှေ့တွင် ချိန်ပါ...</p>
            </div>

            <div className="space-y-1 text-xs text-left">
              <p className="text-gray-500 text-[11px]">နမူနာ Barcode ရွေးချယ်ပြီး အမြန် Scan ဖတ်ပါ:</p>
              <div className="grid grid-cols-2 gap-1">
                {products.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      handleAddToCart(p, 'လက်လီ');
                      setCameraScannerOpen(false);
                    }}
                    className="p-1.5 border rounded text-[11px] font-semibold text-gray-800 hover:bg-orange-50 hover:border-[#ff6600] truncate text-left"
                  >
                    {p.barcode} ({p.name})
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setCameraScannerOpen(false)}
              className="w-full py-2 bg-gray-200 hover:bg-gray-300 rounded text-xs font-semibold text-gray-800"
            >
              ပိတ်မည် (Close Scanner)
            </button>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 md:p-5 max-w-md w-full shadow-2xl border border-gray-200">
            <h3 className="text-sm md:text-base font-bold text-gray-900 border-b pb-2 mb-3">
              ငွေပေးချေမှု အတည်ပြုရန် ({paymentMethod})
            </h3>

            <div className="space-y-3 text-xs mb-4">
              <div className="flex justify-between py-1.5 bg-gray-50 px-3 rounded">
                <span className="text-gray-600">ကျသင့်ငွေ စုစုပေါင်း:</span>
                <span className="font-bold text-sm md:text-base font-mono text-gray-900">
                  {totalCartAmount.toLocaleString()} Ks
                </span>
              </div>

              {paymentMethod === 'Cash' && (
                <div className="space-y-2">
                  <label className="block font-semibold text-gray-700">ပေးငွေ (Tendered Cash):</label>
                  <input
                    type="number"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-gray-300 rounded p-2 text-base font-mono font-bold focus:outline-none focus:border-[#ff6600]"
                  />
                  <div className="flex justify-between text-xs pt-1">
                    <span className="text-gray-600">ပြန်အမ်းငွေ (Change):</span>
                    <span className="font-mono font-bold text-emerald-600 text-sm">
                      {Math.max(0, cashTendered - totalCartAmount).toLocaleString()} Ks
                    </span>
                  </div>
                </div>
              )}

              {paymentMethod === 'Credit' && (
                <div className="p-2.5 bg-yellow-50 border border-yellow-200 text-yellow-900 rounded">
                  ⚠️ ဤအရောင်းသည် အကြွေးအရောင်းဖြစ်ပြီး ရွေးချယ်ထားသော ဖောက်သည်၏ စာရင်းသို့ ထည့်သွင်းသွားမည်ဖြစ်ပါသည်။
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 border-t pt-3">
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
              >
                မလုပ်ဆောင်ပါ
              </button>
              <button
                onClick={handleCompleteSale}
                className="px-5 py-2 text-xs font-bold text-white bg-[#ff6600] hover:bg-[#e65c00] rounded shadow cursor-pointer flex items-center space-x-1"
              >
                <Check className="w-4 h-4" />
                <span>ဘောက်ချာထုတ်မည်</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {receiptModalOpen && lastCompletedSale && (
        <ReceiptModal
          sale={lastCompletedSale}
          onClose={() => setReceiptModalOpen(false)}
        />
      )}
    </div>
  );
};
