import React from 'react';
import { Wifi, Menu, User, Database, RefreshCw, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isSupabaseConfigured } from '../lib/supabase';

interface HeaderProps {
  title?: string;
  totalQty?: number;
  totalAmount?: number;
  hideQuantity?: boolean;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  totalQty,
  totalAmount,
  hideQuantity = false,
  onOpenMobileMenu,
}) => {
  const {
    currentTab,
    reportSubTab,
    sales,
    purchases,
    activeStaff,
    setIsStaffModalOpen,
    setIsHelpModalOpen,
    setIsSupabaseModalOpen,
    syncStatus,
    isRealtimeActive,
    lastSyncedTime,
    remoteSyncNotification,
    setRemoteSyncNotification,
  } = useApp();

  const isCloudConnected = isSupabaseConfigured();



  // Determine Title based on current state if not passed explicitly
  let displayTitle = title;
  if (!displayTitle) {
    if (currentTab === 'reports') {
      displayTitle = reportSubTab === 'sales_purchase' ? 'အရောင်းစာရင်း' : 'စာရင်းချုပ်';
    } else if (currentTab === 'sales') {
      displayTitle = 'အရောင်းကောင်တာ';
    } else if (currentTab === 'purchase') {
      displayTitle = 'အဝယ်စာရင်း';
    } else if (currentTab === 'close_shop') {
      displayTitle = 'ဆိုင်ပိတ်ရန်';
    } else if (currentTab === 'edit') {
      displayTitle = 'ပြင်ဆင်ခြင်း';
    } else if (currentTab === 'income_expense') {
      displayTitle = 'ဝင်ငွေ / ထွက်ငွေ';
    } else if (currentTab === 'bonus') {
      displayTitle = 'ဘောနပ်စ်';
    } else if (currentTab === 'setting') {
      displayTitle = 'Setting';
    } else {
      displayTitle = 'အရောင်းဆိုင်';
    }
  }

  // Calculate default totals if not provided
  let calculatedQty = totalQty;
  let calculatedTotal = totalAmount;

  if (calculatedQty === undefined || calculatedTotal === undefined) {
    if (currentTab === 'reports' || currentTab === 'sales') {
      const q = sales.reduce((sum, s) => sum + s.qty, 0);
      const t = sales.reduce((sum, s) => sum + s.totalAmount, 0);
      calculatedQty = calculatedQty ?? q;
      calculatedTotal = calculatedTotal ?? t;
    } else if (currentTab === 'purchase') {
      const q = purchases.reduce((sum, p) => sum + p.qty, 0);
      const t = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
      calculatedQty = calculatedQty ?? q;
      calculatedTotal = calculatedTotal ?? t;
    } else if (currentTab === 'close_shop') {
      const totalIncome = 376500;
      const totalExpense = 19000000;
      calculatedQty = calculatedQty ?? 0;
      calculatedTotal = calculatedTotal ?? (totalIncome - totalExpense);
    } else {
      calculatedQty = calculatedQty ?? 0;
      calculatedTotal = calculatedTotal ?? 0;
    }
  }

  const isNegative = (calculatedTotal ?? 0) < 0;

  return (
    <header
      id="main-app-header"
      className="bg-white border-b border-gray-200 px-3 md:px-4 py-2 flex items-center justify-between shadow-xs select-none min-h-[54px] md:min-h-[58px]"
    >
      {/* Left side: Mobile menu button + status & staff */}
      <div className="flex items-center space-x-2 md:space-x-4 min-w-0">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-1.5 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer"
          title="Menu"
        >
          <Menu className="w-5 h-5 text-[#ff6600]" />
        </button>

        <div className="hidden sm:flex items-center space-x-1.5 text-xs text-gray-500">
          <Wifi className="w-4 h-4 text-[#ff6600]" />
          <span className="font-mono text-[10px] text-gray-400">v1.0.1.0.5</span>
        </div>

        {/* Staff Switch / PIN Login Button */}
        <button
          id="btn-select-staff"
          onClick={() => setIsStaffModalOpen(true)}
          className="flex items-center space-x-1.5 text-xs font-semibold text-gray-800 bg-orange-50/80 hover:bg-orange-100 hover:text-[#ff6600] border border-orange-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
          title="Admin / Staff PIN Code ဖြင့် အကောင့်ပြောင်းရန်"
        >
          <div className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-bold">
            {activeStaff?.name ? activeStaff.name.charAt(0) : 'A'}
          </div>
          <div className="flex flex-col text-left leading-none hidden sm:flex">
            <span className="text-[11px] font-bold text-gray-900">{activeStaff?.name || 'Admin'}</span>
            <span className="text-[9px] text-gray-500 font-medium">{activeStaff?.role || 'Admin'}</span>
          </div>
          <span className="sm:hidden text-xs font-bold text-gray-900">{activeStaff?.name || 'Admin'}</span>
        </button>

        {/* Main View Title */}
        <div className="pl-2 border-l border-gray-300 truncate">
          <h1 className="text-base md:text-xl font-bold text-gray-900 tracking-tight truncate">
            {displayTitle}
          </h1>
        </div>
      </div>

      {/* Right side: Total Quantity & Total Amount & Help */}
      <div className="flex items-center space-x-2 md:space-x-6 shrink-0">
        <div className="flex flex-col items-end">
          {!hideQuantity && (
            <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-600">
              <span className="text-gray-500 text-[11px]">Qty:</span>
              <span className="font-bold text-xs text-gray-900 tracking-tight">
                {Math.round(calculatedQty ?? 0)}
              </span>
            </div>
          )}

          <div className="flex items-baseline space-x-1.5 md:space-x-3 text-xs md:text-sm">
            <span className="text-gray-500 text-[11px] font-medium hidden sm:inline">Total</span>
            <div className="flex items-baseline space-x-0.5">
              <span
                className={`font-black text-sm md:text-xl tracking-tight ${
                  isNegative ? 'text-red-600' : 'text-gray-900'
                }`}
              >
                {(calculatedTotal ?? 0).toLocaleString()}
              </span>
              <span className="text-[10px] md:text-xs font-semibold text-gray-600">Ks</span>
            </div>
          </div>
        </div>

        {/* Total Display */}
        <div className="flex flex-col items-end">
          {!hideQuantity && (
            <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-600">
              <span className="text-gray-500 text-[11px]">Qty:</span>
              <span className="font-bold text-xs text-gray-900 tracking-tight">
                {Math.round(calculatedQty ?? 0)}
              </span>
            </div>
          )}

          <div className="flex items-baseline space-x-1.5 md:space-x-3 text-xs md:text-sm">
            <span className="text-gray-500 text-[11px] font-medium hidden sm:inline">Total</span>
            <div className="flex items-baseline space-x-0.5">
              <span
                className={`font-black text-sm md:text-xl tracking-tight ${
                  isNegative ? 'text-red-600' : 'text-gray-900'
                }`}
              >
                {(calculatedTotal ?? 0).toLocaleString()}
              </span>
              <span className="text-[10px] md:text-xs font-semibold text-gray-600">Ks</span>
            </div>
          </div>
        </div>

        {/* Floating Remote Sync Notification Toast (only when remote update occurs) */}
        {remoteSyncNotification && (
          <div className="fixed top-16 right-4 z-80 bg-slate-900/95 text-white px-3.5 py-2 rounded-xl shadow-xl border border-emerald-500/40 flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Zap className="w-3 h-3 animate-bounce" />
            </div>
            <span className="text-xs font-medium text-emerald-200">{remoteSyncNotification}</span>
            <button
              onClick={() => setRemoteSyncNotification(null)}
              className="text-slate-400 hover:text-white text-xs ml-2 cursor-pointer font-bold"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

