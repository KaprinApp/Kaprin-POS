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
    setIsSupabaseModalOpen,
    syncStatus,
    isRealtimeActive,
    lastSyncedTime,
    triggerManualSync,
  } = useApp();

  const totalSalesAmount = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalGrossProfit = sales.reduce((sum, s) => sum + s.grossProfit, 0);
  const lowStockItems = products.filter((p) => p.stockQty <= (p.minStockLevel || 5));
  const isCloudConnected = isSupabaseConfigured();
  const config = getActiveSupabaseConfig();

  return (
    <div id="shop-dashboard-view" className="flex-1 flex flex-col h-full bg-[#f8f9fa] select-none overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 pb-20 md:pb-6">
      {/* SUPABASE CLOUD DATABASE PROMINENT REALTIME BOX */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-inner">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h2 className="font-bold text-base text-white">Supabase Cloud Database & Realtime Auto-Sync</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide flex items-center space-x-1 ${
                    isCloudConnected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isCloudConnected && isRealtimeActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                  <span>{isCloudConnected ? (isRealtimeActive ? '● Realtime Live Synced' : '● Auto-Sync Ready') : '● Setup Required'}</span>
                </span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-300 mt-1 flex-wrap gap-y-1">
                <span className="font-mono truncate max-w-xs">
                  URL: <span className="text-emerald-400 font-bold">{config.url}</span>
                </span>
                {lastSyncedTime && (
                  <span className="text-[11px] text-slate-400 border-l border-slate-700 pl-2.5">
                    Sync ချိန်: <span className="text-emerald-400 font-mono font-semibold">{lastSyncedTime}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-stretch sm:self-auto shrink-0">
            <button
              id="btn-dash-open-supabase"
              onClick={() => setIsSupabaseModalOpen(true)}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center justify-center space-x-1.5 shadow-xs transition-colors"
            >
              <Zap className="w-4 h-4 text-emerald-200" />
              <span>Supabase Box & Status</span>
            </button>

            <button
              id="btn-dash-goto-settings"
              onClick={() => setCurrentTab('setting')}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs px-3.5 py-2.5 rounded-xl cursor-pointer flex items-center justify-center space-x-1.5 transition-colors"
              title="Settings ထဲတွင် အသေးစိတ် ကြည့်ရှုရန်"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>

        {/* Feature Pills */}
        {isCloudConnected && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-300">
            <div className="flex items-center space-x-1.5 bg-slate-950/50 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <DownloadCloud className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>1. အက်ပ်ဖွင့်လျှင် Cloud မှ Auto Fetch ပြုလုပ်သည်</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-950/50 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <UploadCloud className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>2. စာရင်းပြောင်းတိုင်း Background Auto Save ဖြစ်သည်</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-950/50 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <Radio className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>3. PC / ဖုန်း အချင်းချင်း Realtime တိုက်ရိုက်ချိတ်ဆက်ထားသည်</span>
            </div>
          </div>
        )}
      </div>


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
