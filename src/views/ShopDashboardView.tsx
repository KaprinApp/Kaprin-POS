import React from 'react';
import {
  ShoppingCart,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  FileText,
  LogOut,
  Users,
  Package,
  ArrowUpRight,
  Database,
  UploadCloud,
  DownloadCloud,
  CheckCircle2,
  Settings,
  Sparkles,
  Zap,
  Radio,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isSupabaseConfigured, getActiveSupabaseConfig } from '../lib/supabase';

export const ShopDashboardView: React.FC = () => {
  const {
    sales,
    purchases,
    products,
    customers,
    setCurrentTab,
    setReportSubTab,
  } = useApp();

  const totalSalesAmount = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalGrossProfit = sales.reduce((sum, s) => sum + s.grossProfit, 0);
  const lowStockItems = products.filter((p) => p.stockQty <= (p.minStockLevel || 5));

  return (
    <div id="shop-dashboard-view" className="flex-1 flex flex-col h-full bg-[#f8f9fa] select-none overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 pb-20 md:pb-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-semibold">ယနေ့ အရောင်းရငွေ (Today Sales)</span>
            <div className="w-8 h-8 rounded bg-orange-100 text-[#ff6600] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-black font-mono text-gray-900">
              {totalSalesAmount.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-gray-500">Ks</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">
            အကြမ်းအမြတ်: +{totalGrossProfit.toLocaleString()} Ks
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-semibold">အရောင်းဘောက်ချာ အရေအတွက်</span>
            <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-black font-mono text-gray-900">{sales.length}</span>
            <span className="text-xs font-semibold text-gray-500">ခု</span>
          </div>
          <div className="mt-1 text-[11px] text-gray-500">
            စုစုပေါင်း ပစ္စည်းအရေအတွက် {sales.reduce((s, i) => s + i.qty, 0)} ခု
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-semibold">ပစ္စည်း စာရင်းပေါင်း (Catalog)</span>
            <div className="w-8 h-8 rounded bg-purple-100 text-purple-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-black font-mono text-gray-900">{products.length}</span>
            <span className="text-xs font-semibold text-gray-500">မျိုး</span>
          </div>
          <div className="mt-1 text-[11px] text-gray-500">
            စုစုပေါင်း သိုလှောင်ရုံလက်ကျန် {products.reduce((s, p) => s + p.stockQty, 0)} ခု
          </div>
        </div>

        <div
          onClick={() => setCurrentTab('inventory')}
          className="bg-white border border-gray-200 hover:border-red-400 rounded-lg p-4 shadow-xs cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-semibold">ပစ္စည်းလက်ကျန် နည်းပါးမှု (Low Stock)</span>
            <div className="w-8 h-8 rounded bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-black font-mono text-red-600">
              {lowStockItems.length}
            </span>
            <span className="text-xs font-semibold text-gray-500">မျိုး</span>
          </div>
          <div className="mt-1 text-[11px] text-red-500 font-semibold flex items-center justify-between">
            <span>ပြန်လည်ဖြည့်တင်းရန် လိုအပ်သည်</span>
            <span className="text-red-700 underline font-normal">စစ်ဆေးရန် →</span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => setCurrentTab('sales')}
          className="bg-white hover:bg-orange-50 border border-gray-200 hover:border-[#ff6600] p-3 md:p-4 rounded-lg flex items-center justify-between shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-orange-100 text-[#ff6600] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="font-bold text-xs text-gray-900">အရောင်းကောင်တာ</div>
              <div className="text-[10px] text-gray-500 hidden sm:block">Open POS Terminal</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-[#ff6600]" />
        </button>

        <button
          onClick={() => setCurrentTab('purchase')}
          className="bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-500 p-3 md:p-4 rounded-lg flex items-center justify-between shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="font-bold text-xs text-gray-900">အဝယ်စာရင်းသွင်းရန်</div>
              <div className="text-[10px] text-gray-500 hidden sm:block">Stock In Purchase</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
        </button>

        <button
          onClick={() => {
            setCurrentTab('reports');
            setReportSubTab('sales_purchase');
          }}
          className="bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-500 p-3 md:p-4 rounded-lg flex items-center justify-between shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="font-bold text-xs text-gray-900">စာရင်းချုပ် စစ်ဆေးရန်</div>
              <div className="text-[10px] text-gray-500 hidden sm:block">Daily Records & Ledger</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
        </button>

        <button
          onClick={() => setCurrentTab('close_shop')}
          className="bg-white hover:bg-red-50 border border-gray-200 hover:border-red-500 p-3 md:p-4 rounded-lg flex items-center justify-between shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <LogOut className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="font-bold text-xs text-gray-900">ဆိုင်ပိတ်သိမ်းခြင်း</div>
              <div className="text-[10px] text-gray-500 hidden sm:block">End Day Settlement</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
        </button>
      </div>

      {/* Recent Sales Overview */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="font-bold text-xs text-gray-800">ယနေ့ လတ်တလော အရောင်းမှတ်တမ်းများ (Recent Sales)</h3>
          <button
            onClick={() => {
              setCurrentTab('reports');
              setReportSubTab('sales_purchase');
            }}
            className="text-xs text-[#ff6600] font-semibold hover:underline cursor-pointer"
          >
            အားလုံးကြည့်ရန် →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-gray-100 text-gray-700 font-bold border-b">
                <th className="p-2.5">ရက်စွဲ</th>
                <th className="p-2.5">ဘောက်ချာ</th>
                <th className="p-2.5">Barcode</th>
                <th className="p-2.5">ပစ္စည်းအမည်</th>
                <th className="p-2.5 text-right">အရေအတွက်</th>
                <th className="p-2.5 text-right">ကျသင့်ငွေ</th>
                <th className="p-2.5 text-center">ပုံစံ</th>
              </tr>
            </thead>
            <tbody>
              {sales.slice(0, 6).map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-2.5 font-mono text-gray-800">{s.date}</td>
                  <td className="p-2.5 font-mono text-gray-800">{s.voucherNo}</td>
                  <td className="p-2.5 font-mono font-medium text-gray-900">{s.barcode}</td>
                  <td className="p-2.5 font-medium text-gray-900">{s.itemName}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-gray-900">{s.qty} {s.unit}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-[#ff6600]">{s.totalAmount.toLocaleString()} Ks</td>
                  <td className="p-2.5 text-center font-medium text-gray-700">{s.saleType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
