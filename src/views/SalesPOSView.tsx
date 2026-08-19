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
  ArrowRight,
  ArrowLeft,
  Zap,
  Tag,
  CheckCircle2,
  ShoppingCart,
  Receipt,
  Sparkles,
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
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

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

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => {
      setFeedbackToast((prev) => (prev === msg ? null : prev));
    }, 1800);
  };

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

    showToast(`"${product.name}" ခြင်းတောင်းထဲ ထည့်ပြီးပါပြီ`);
  };

  // Instant 1-Click Sell for a specific single product
  const handleDirectSingleProductSale = (product: Product) => {
    const singleItem: CartItem = {
      product,
      qty: 1,
      selectedPriceType: 'လက်လီ',
      unitPrice: product.retailPrice,
      discount: 0,
      total: product.retailPrice,
    };
    executeCustomSale([singleItem], 'Cash', product.retailPrice);
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

  const updateDiscount = (idx: number, discountAmount: number) => {
    setCart((prev) => {
      const updated = [...prev];
      const safeDiscount = Math.max(0, discountAmount || 0);
      updated[idx] = {
        ...updated[idx],
        discount: safeDiscount,
        total: Math.max(0, updated[idx].qty * updated[idx].unitPrice - safeDiscount),
      };
      return updated;
    });
  };

  const removeFromCart = (idx: number) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm('ခြင်းတောင်းထဲရှိ ပစ္စည်းအားလုံးကို ဖျက်ရန် သေချာပါသလား?')) {
      setCart([]);
    }
  };

  const totalCartQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalCartAmount = cart.reduce((sum, item) => sum + item.total, 0);
  const totalCartDiscount = cart.reduce((sum, item) => sum + item.discount, 0);

  const getCartItemQty = (productId: string) => {
    return cart
      .filter((item) => item.product.id === productId)
      .reduce((sum, item) => sum + item.qty, 0);
  };

  // Open the primary Checkout/Payment Modal
  const handleOpenPayment = (method: PaymentMethod = 'Cash') => {
    if (cart.length === 0) {
      alert('ကျေးဇူးပြု၍ အရောင်းတင်မည့် ပစ္စည်းများကို ဦးစွာ ရွေးချယ်ပါ!');
      return;
    }
    setPaymentMethod(method);
    setCashTendered(totalCartAmount);
    setPaymentModalOpen(true);
  };

  // Instant 1-Click Cash Sale for all items in Cart
  const handleDirectQuickCashSale = () => {
    if (cart.length === 0) {
      alert('ကျေးဇူးပြု၍ အရောင်းတင်မည့် ပစ္စည်းများကို ဦးစွာ ရွေးချယ်ပါ!');
      return;
    }
    executeCustomSale(cart, 'Cash', totalCartAmount);
  };

  const executeCustomSale = (
    itemsToSell: CartItem[],
    chosenMethod: PaymentMethod,
    tendered: number
  ) => {
    if (itemsToSell.length === 0) return;

    const totalAmt = itemsToSell.reduce((sum, it) => sum + it.total, 0);
    const today = new Date();
    const formattedDate = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(
      today.getDate()
    ).padStart(2, '0')}/${today.getFullYear()}`;
    const voucherNo = `V.${today.getFullYear()}${String(today.getMonth() + 1).padStart(
      2,
      '0'
    )}${String(today.getDate()).padStart(2, '0')}.${Math.floor(1000 + Math.random() * 9000)}`;

    const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

    const saleRecords = itemsToSell.map((item) => {
      const grossProfit =
        (item.unitPrice - item.product.buyPrice) * item.qty - item.discount;

      return {
        date: formattedDate,
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
        paymentMethod: chosenMethod,
        customerId: selectedCustomerId || undefined,
        customerName: selectedCustomer ? selectedCustomer.name : undefined,
      };
    });

    addMultipleSaleRecords(saleRecords);

    setLastCompletedSale({
      voucherNo,
      items: [...itemsToSell],
      paymentMethod: chosenMethod,
      totalAmount: totalAmt,
      cashTendered: chosenMethod === 'Cash' ? tendered : totalAmt,
      changeAmount:
        chosenMethod === 'Cash' ? Math.max(0, tendered - totalAmt) : 0,
      customerName: selectedCustomer
        ? selectedCustomer.name
        : 'လက်လီဝယ်ယူသူ (General Customer)',
      date: formattedDate,
    });

    setPaymentModalOpen(false);
    setCart([]);
    setReceiptModalOpen(true);
    showToast('✅ အရောင်းစာရင်း အောင်မြင်စွာ တင်ပြီးပါပြီ!');
  };

  const handleConfirmModalSale = () => {
    if (paymentMethod === 'Cash' && cashTendered < totalCartAmount) {
      if (
        !window.confirm(
          `ပေးငွေ (${cashTendered.toLocaleString()} Ks) သည် ကျသင့်ငွေ (${totalCartAmount.toLocaleString()} Ks) ထက် နည်းနေပါသည်။ အရောင်းတင်မည်မှာ သေချာပါသလား?`
        )
      ) {
        return;
      }
    }
    executeCustomSale(cart, paymentMethod, cashTendered);
  };

  // Keyboard shortcut (F9 or Ctrl+Enter to sell)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F9' || (e.ctrlKey && e.key === 'Enter')) {
        e.preventDefault();
        if (cart.length > 0) {
          handleOpenPayment('Cash');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, totalCartAmount]);

  const cashShortcuts = [
    { label: 'Exact (အတိအကျ)', value: totalCartAmount },
    { label: '1,000', value: 1000 },
    { label: '5,000', value: 5000 },
    { label: '10,000', value: 10000 },
    { label: '20,000', value: 20000 },
    { label: '50,000', value: 50000 },
    { label: '100,000', value: 100000 },
  ];

  return (
    <div
      id="sales-pos-terminal"
      className="flex-1 flex flex-col md:flex-row h-full bg-[#f8f9fa] overflow-hidden select-none pb-20 md:pb-0 relative"
    >
      {/* Toast Feedback Notification */}
      {feedbackToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded-full shadow-2xl text-xs font-bold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 border border-gray-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Mobile Top View Switcher */}
      <div className="md:hidden flex items-center bg-white border-b border-gray-200 p-2 shrink-0 justify-around z-10 shadow-xs">
        <button
          onClick={() => setMobileTab('catalog')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
            mobileTab === 'catalog'
              ? 'bg-[#ff6600] text-white shadow-xs'
              : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>ပစ္စည်းများ (Catalog)</span>
        </button>
        <button
          onClick={() => setMobileTab('cart')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all ml-2 cursor-pointer relative ${
            mobileTab === 'cart'
              ? 'bg-[#ff6600] text-white shadow-xs'
              : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>ခြင်းတောင်း ({cart.length})</span>
          {cart.length > 0 && (
            <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-mono ml-1 font-bold">
              {totalCartAmount.toLocaleString()} Ks
            </span>
          )}
        </button>
      </div>

      {/* Left Area: Product Selector & Barcode Scanner */}
      <div
        className={`flex-1 flex flex-col border-r border-gray-300 p-2.5 md:p-3 overflow-hidden ${
          mobileTab === 'cart' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Barcode & Search Controls */}
        <div className="bg-white p-2.5 md:p-3 rounded-xl border border-gray-200 shadow-xs mb-2 md:mb-3 space-y-2 shrink-0">
          <form onSubmit={handleBarcodeSubmit} className="flex items-center space-x-1.5 md:space-x-2">
            <div className="relative flex-1">
              <input
                ref={barcodeInputRef}
                id="pos-barcode-input"
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Barcode ရိုက်ထည့်ပါ သို့မဟုတ် Scan ဖတ်ပါ..."
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 pl-9 font-mono text-xs md:text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-[#ff6600]"
              />
              <Barcode className="w-4 h-4 text-gray-500 absolute left-2.5 top-2.5" />
            </div>

            {/* Camera Barcode Trigger */}
            <button
              type="button"
              onClick={() => setCameraScannerOpen(true)}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 rounded-lg cursor-pointer transition-colors"
              title="Camera Barcode Scanner"
            >
              <Camera className="w-4 h-4 text-gray-800" />
            </button>

            <button
              type="submit"
              className="bg-[#ff6600] hover:bg-[#e65c00] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs cursor-pointer shrink-0 transition-colors"
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
                placeholder="ပစ္စည်းအမည် / Barcode ဖြင့် ရှာရန်..."
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 pl-8 text-xs text-gray-800 focus:bg-white focus:outline-none focus:border-[#ff6600]"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center space-x-1 overflow-x-auto py-0.5 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-gray-800 text-white font-bold'
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
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pr-0.5 pb-2">
          {filteredProducts.map((prod) => {
            const inCartQty = getCartItemQty(prod.id);
            return (
              <div
                key={prod.id}
                className={`bg-white border rounded-xl p-2.5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all group relative ${
                  inCartQty > 0
                    ? 'border-[#ff6600] ring-2 ring-[#ff6600]/30 bg-orange-50/20'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                {/* Product Info (Clicking info adds to cart) */}
                <div
                  onClick={() => handleAddToCart(prod, 'လက်လီ')}
                  className="cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">
                      {prod.barcode}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                        prod.stockQty > 5
                          ? 'bg-green-100 text-green-700'
                          : prod.stockQty > 0
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {prod.stockQty} {prod.unit}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-gray-900 line-clamp-2 group-hover:text-[#ff6600] mt-0.5">
                    {prod.name}
                  </h4>
                  <div className="text-[10px] text-gray-400 mt-0.5">{prod.category}</div>

                  <div className="mt-2 flex items-baseline justify-between">
                    <div>
                      <div className="text-[9px] text-gray-400">လက်လီဈေး</div>
                      <div className="font-bold text-xs sm:text-sm text-gray-900 font-mono">
                        {prod.retailPrice.toLocaleString()} Ks
                      </div>
                    </div>

                    {inCartQty > 0 && (
                      <span className="bg-[#ff6600] text-white font-bold text-xs px-2 py-0.5 rounded-full shadow-xs">
                        {inCartQty} ခု
                      </span>
                    )}
                  </div>
                </div>

                {/* Direct Action Buttons on Card */}
                <div className="mt-2.5 pt-2 border-t border-gray-100 grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleAddToCart(prod, 'လက်လီ')}
                    className="py-1.5 px-2 bg-orange-50 hover:bg-orange-100 text-[#ff6600] font-bold text-[11px] rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition-colors active:scale-95"
                    title="ခြင်းတောင်းထဲ ထည့်မည်"
                  >
                    <Plus className="w-3 h-3" />
                    <span>ထည့်မည်</span>
                  </button>

                  <button
                    onClick={() => handleDirectSingleProductSale(prod)}
                    className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition-colors shadow-xs active:scale-95"
                    title="၁ ချက်နှိပ်ပြီး ချက်ချင်းရောင်းမည်"
                  >
                    <Zap className="w-3 h-3" />
                    <span>ရောင်းမည်</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Sticky Floating Cart Bar (When in Catalog Tab) */}
        {cart.length > 0 && (
          <div className="md:hidden mt-2 pt-1 shrink-0 z-20">
            <div className="bg-gray-900 text-white p-3 rounded-2xl shadow-2xl flex items-center justify-between border border-gray-700">
              <div
                onClick={() => setMobileTab('cart')}
                className="cursor-pointer flex-1"
              >
                <div className="flex items-center space-x-1.5 text-xs text-gray-300">
                  <ShoppingCart className="w-4 h-4 text-orange-400" />
                  <span>ခြင်းတောင်း: <strong className="text-white">{totalCartQty} ခု</strong></span>
                </div>
                <div className="font-mono text-base font-black text-emerald-400">
                  {totalCartAmount.toLocaleString()} Ks
                </div>
              </div>

              <button
                id="btn-mobile-sell-now"
                onClick={() => handleOpenPayment('Cash')}
                className="bg-[#ff6600] hover:bg-[#e65c00] text-white font-black text-xs py-2.5 px-4 rounded-xl shadow-lg flex items-center space-x-1.5 cursor-pointer active:scale-95 transition-all shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>အရောင်းတင်မည် →</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Area: Checkout Cart & Voucher Slip */}
      <div
        className={`w-full md:w-96 lg:w-[420px] bg-white flex flex-col h-full shadow-xl shrink-0 ${
          mobileTab === 'catalog' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Cart Header */}
        <div className="p-2.5 md:p-3 bg-gray-100 border-b border-gray-300 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMobileTab('catalog')}
              className="md:hidden text-gray-600 hover:text-gray-900 p-1 mr-1 rounded-lg bg-gray-200"
              title="ပစ္စည်းများသို့ ပြန်သွားရန်"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <ShoppingCart className="w-4 h-4 text-[#ff6600]" />
            <h3 className="font-bold text-xs md:text-sm text-gray-900">
              အရောင်းဘောက်ချာ ({cart.length} မျိုး)
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMobileTab('catalog')}
              className="md:hidden text-xs text-[#ff6600] font-semibold underline"
            >
              + ပစ္စည်းထပ်ထည့်ရန်
            </button>
            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              className="text-xs text-gray-500 hover:text-red-600 disabled:opacity-30 flex items-center space-x-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ရှင်းမည်</span>
            </button>
          </div>
        </div>

        {/* Customer Selector */}
        <div className="p-2 bg-gray-50 border-b border-gray-200 shrink-0">
          <div className="flex items-center space-x-1.5 text-xs">
            <User className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="flex-1 bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-[#ff6600]"
            >
              <option value="">လက်လီဝယ်ယူသူ (General Retail Customer)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.creditBalance > 0 ? `(ကြွေးကျန်: ${c.creditBalance.toLocaleString()} Ks)` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3 py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-300">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">ဘောက်ချာတွင် ပစ္စည်း မရှိသေးပါ</p>
                <p className="text-xs text-gray-400 mt-1">ဘယ်ဘက်ရှိ ပစ္စည်းများကို နှိပ်ပြီး ထည့်ပါ</p>
              </div>
              <button
                onClick={() => setMobileTab('catalog')}
                className="bg-[#ff6600] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs hover:bg-[#e65c00] cursor-pointer flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>ပစ္စည်းများ ရွေးချယ်ရန်</span>
              </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={`${item.product.id}-${item.selectedPriceType}`}
                className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs space-y-2 shadow-2xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-gray-900 text-xs">{item.product.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono">{item.product.barcode}</div>
                  </div>
                  <button
                    onClick={() => removeFromCart(idx)}
                    className="text-gray-400 hover:text-red-600 p-1 cursor-pointer"
                    title="ဖျက်မည်"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Price Type & Unit Price */}
                <div className="flex items-center justify-between text-[11px] bg-white p-1.5 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-gray-500">ဈေးနှုန်း:</span>
                    <select
                      value={item.selectedPriceType}
                      onChange={(e) => updatePriceType(idx, e.target.value as SaleType)}
                      className="bg-gray-50 border border-gray-300 rounded px-1.5 py-0.5 text-gray-800 text-[11px] font-semibold focus:outline-none"
                    >
                      <option value="လက်လီ">လက်လီ</option>
                      <option value="လက်ကား ၁">လက်ကား ၁</option>
                      <option value="လက်ကား ၂">လက်ကား ၂</option>
                    </select>
                  </div>
                  <span className="font-mono font-bold text-gray-900">
                    {item.unitPrice.toLocaleString()} Ks
                  </span>
                </div>

                {/* Qty & Discount & Subtotal */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                  {/* Qty Controls */}
                  <div className="flex items-center space-x-1 bg-white border border-gray-300 rounded-lg p-0.5">
                    <button
                      onClick={() => updateCartQty(idx, item.qty - 1)}
                      className="w-6 h-6 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded cursor-pointer font-bold"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => updateCartQty(idx, parseFloat(e.target.value) || 1)}
                      className="w-10 text-center font-mono font-bold text-xs bg-transparent focus:outline-none"
                    />
                    <button
                      onClick={() => updateCartQty(idx, item.qty + 1)}
                      className="w-6 h-6 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded cursor-pointer font-bold"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Discount Input */}
                  <div className="flex items-center space-x-1 text-[11px]">
                    <span className="text-[10px] text-gray-400">လျှော့:</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={item.discount || ''}
                      onChange={(e) => updateDiscount(idx, parseFloat(e.target.value) || 0)}
                      className="w-12 bg-white border border-gray-300 rounded px-1 py-0.5 text-right font-mono text-[11px] focus:outline-none"
                    />
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <div className="font-bold text-xs md:text-sm text-[#ff6600] font-mono">
                      {item.total.toLocaleString()} Ks
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* PRIMARY CHECKOUT & SELL SECTION (UNMISSABLE BUTTONS) */}
        <div className="p-3 bg-gray-100 border-t border-gray-300 space-y-2.5 shrink-0 shadow-inner">
          <div className="flex justify-between text-xs text-gray-600">
            <span>စုစုပေါင်း အရေအတွက်:</span>
            <span className="font-mono font-bold text-gray-900">{totalCartQty.toFixed(0)} ခု</span>
          </div>

          {totalCartDiscount > 0 && (
            <div className="flex justify-between text-xs text-amber-700 font-semibold">
              <span>စုစုပေါင်း လျှော့ငွေ:</span>
              <span className="font-mono font-bold">-{totalCartDiscount.toLocaleString()} Ks</span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm font-bold text-gray-900 pt-1 border-t border-gray-300">
            <span>ကျသင့်ငွေ စုစုပေါင်း:</span>
            <span className="text-xl md:text-2xl font-mono font-black text-[#ff6600]">
              {totalCartAmount.toLocaleString()} Ks
            </span>
          </div>

          {/* MAIN PROMINENT SELL BUTTON (အရောင်းတင်မည် ခလုတ်ကြီး) */}
          <button
            id="btn-main-submit-sale"
            disabled={cart.length === 0}
            onClick={() => handleOpenPayment('Cash')}
            className={`w-full py-3.5 px-4 rounded-xl text-white font-black text-sm md:text-base flex items-center justify-center space-x-2 shadow-lg transition-all active:scale-98 cursor-pointer ${
              cart.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-400/50'
                : 'bg-gray-400 cursor-not-allowed opacity-60'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>အရောင်းတင်မည် (ငွေရှင်းရန် F9)</span>
          </button>

          {/* Secondary Quick Payment Options */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              id="btn-quick-cash"
              disabled={cart.length === 0}
              onClick={handleDirectQuickCashSale}
              className="bg-[#ff6600] hover:bg-[#e65c00] active:scale-95 disabled:opacity-40 text-white text-[11px] font-bold py-2 rounded-lg shadow-xs flex flex-col items-center justify-center cursor-pointer transition-all"
              title="ငွေအပြည့်ရရှိပြီး ၁ ချက်နှိပ် အရောင်းတင်မည်"
            >
              <Zap className="w-3.5 h-3.5 mb-0.5" />
              <span>ငွေသားအမြန်</span>
            </button>

            <button
              id="btn-pay-bank"
              disabled={cart.length === 0}
              onClick={() => handleOpenPayment('Bank')}
              className="bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-40 text-white text-[11px] font-bold py-2 rounded-lg shadow-xs flex flex-col items-center justify-center cursor-pointer transition-all"
            >
              <CreditCard className="w-3.5 h-3.5 mb-0.5" />
              <span>KPay / Bank</span>
            </button>

            <button
              id="btn-pay-credit"
              disabled={cart.length === 0}
              onClick={() => handleOpenPayment('Credit')}
              className="bg-purple-600 hover:bg-purple-700 active:scale-95 disabled:opacity-40 text-white text-[11px] font-bold py-2 rounded-lg shadow-xs flex flex-col items-center justify-center cursor-pointer transition-all"
            >
              <Clock className="w-3.5 h-3.5 mb-0.5" />
              <span>အကြွေးရောင်း</span>
            </button>
          </div>
        </div>
      </div>

      {/* Camera Barcode Scanner Simulator Modal */}
      {cameraScannerOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full shadow-2xl text-center space-y-3">
            <h3 className="font-bold text-sm text-gray-900 flex items-center justify-center gap-1.5">
              <Camera className="w-4 h-4 text-[#ff6600]" />
              <span>Mobile Camera Barcode Scan</span>
            </h3>

            <div className="relative bg-black rounded-xl aspect-4/3 flex items-center justify-center overflow-hidden border-2 border-dashed border-[#ff6600]">
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-red-500 animate-pulse shadow-md"></div>
              <p className="text-white text-xs px-4">ပစ္စည်း Barcode ကို ကင်မရာရှေ့တွင် ချိန်ပါ...</p>
            </div>

            <div className="space-y-1 text-xs text-left">
              <p className="text-gray-500 text-[11px]">နမူနာ Barcode ရွေးချယ်ပြီး အမြန် Scan ဖတ်ပါ:</p>
              <div className="grid grid-cols-2 gap-1.5">
                {products.slice(0, 6).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      handleAddToCart(p, 'လက်လီ');
                      setCameraScannerOpen(false);
                    }}
                    className="p-2 border rounded-lg text-[11px] font-semibold text-gray-800 hover:bg-orange-50 hover:border-[#ff6600] truncate text-left cursor-pointer"
                  >
                    <div className="font-mono text-[10px] text-gray-500">{p.barcode}</div>
                    <div className="truncate font-bold">{p.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setCameraScannerOpen(false)}
              className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 rounded-xl text-xs font-semibold text-gray-800 cursor-pointer"
            >
              ပိတ်မည် (Close Scanner)
            </button>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal (အရောင်းတင်ခြင်း အတည်ပြုရန်) */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-gray-200 zoom-in-95 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-[#ff6600]" />
                <span>အရောင်းတင်ခြင်း (ငွေပေးချေမှု အတည်ပြုရန်)</span>
              </h3>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 rounded-xl mb-3 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPaymentMethod('Cash')}
                className={`py-2 rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition-all ${
                  paymentMethod === 'Cash'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-white/60'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>ငွေသား (Cash)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Bank')}
                className={`py-2 rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition-all ${
                  paymentMethod === 'Bank'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-white/60'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>KPay / Bank</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Credit')}
                className={`py-2 rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition-all ${
                  paymentMethod === 'Credit'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-white/60'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>အကြွေးရောင်း</span>
              </button>
            </div>

            <div className="space-y-3 text-xs mb-4">
              {/* Total Payable Box */}
              <div className="flex justify-between py-3 bg-orange-50 border border-orange-200 px-4 rounded-xl items-center">
                <div>
                  <span className="text-gray-600 font-semibold block text-[11px]">ကျသင့်ငွေ စုစုပေါင်း ({totalCartQty} ခု):</span>
                  <span className="text-[10px] text-gray-500 font-mono">{cart.length} မျိုး</span>
                </div>
                <span className="font-black text-xl md:text-2xl font-mono text-[#ff6600]">
                  {totalCartAmount.toLocaleString()} Ks
                </span>
              </div>

              {/* Customer Selector inside Modal */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">ဝယ်ယူသူဖောက်သည်:</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-[#ff6600]"
                >
                  <option value="">လက်လီဝယ်ယူသူ (General Retail Customer)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.creditBalance > 0 ? `(ကြွေးကျန်: ${c.creditBalance.toLocaleString()} Ks)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {paymentMethod === 'Cash' && (
                <div className="space-y-2.5 pt-1">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">ပေးငွေ (Tendered Cash):</label>
                    <input
                      type="number"
                      value={cashTendered || ''}
                      onChange={(e) => setCashTendered(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border-2 border-emerald-500 rounded-xl p-2.5 text-lg font-mono font-bold focus:outline-none"
                    />
                  </div>

                  {/* Cash Quick Presets */}
                  <div className="flex flex-wrap gap-1.5">
                    {cashShortcuts.map((sc, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCashTendered(sc.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold cursor-pointer border ${
                          cashTendered === sc.value
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        {sc.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-xs p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <span className="text-emerald-900 font-semibold">ပြန်အမ်းငွေ (Change):</span>
                    <span className="font-mono font-black text-emerald-700 text-lg">
                      {Math.max(0, cashTendered - totalCartAmount).toLocaleString()} Ks
                    </span>
                  </div>
                </div>
              )}

              {paymentMethod === 'Bank' && (
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl space-y-1">
                  <div className="font-bold flex items-center space-x-1.5">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>KPay / Wave / AYA / CB Pay စနစ်</span>
                  </div>
                  <div className="text-[11px] text-blue-700">
                    ဖောက်သည်မှ မိုဘိုင်းဘဏ်ဖြင့် ငွေလွှဲပြီးကြောင်း အတည်ပြုပြီး အရောင်းတင်ပါ။
                  </div>
                </div>
              )}

              {paymentMethod === 'Credit' && (
                <div className="p-3 bg-purple-50 border border-purple-200 text-purple-900 rounded-xl space-y-1">
                  <div className="font-bold flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span>အကြွေးအရောင်း (Credit Sale)</span>
                  </div>
                  <div className="text-[11px] text-purple-700">
                    {selectedCustomerId
                      ? `ဖောက်သည် "${customers.find((c) => c.id === selectedCustomerId)?.name}" ၏ အကြွေးစာရင်းသို့ ထည့်သွင်းသွားပါမည်။`
                      : '⚠️ သတိပေးချက်: ဖောက်သည် မရွေးချယ်ထားပါက အထွေထွေ အကြွေးစာရင်းသို့ မှတ်တမ်းတင်ပါမည်။'}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex space-x-2 border-t pt-3.5">
              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                className="flex-1 py-3 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer"
              >
                မလုပ်ဆောင်ပါ
              </button>
              <button
                type="button"
                id="btn-confirm-final-sale"
                onClick={handleConfirmModalSale}
                className="flex-2 py-3 text-xs md:text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg cursor-pointer flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>အရောင်းတင်မည် (သိမ်းမည်)</span>
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
