import React from 'react';
import {
  X,
  Home,
  ShoppingCart,
  ShoppingBag,
  Edit3,
  CircleDollarSign,
  FileText,
  Settings,
  LogOut,
  User,
  HelpCircle,
  Database,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NavTab } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const {
    currentTab,
    setCurrentTab,
    activeStaff,
    setIsStaffModalOpen,
    setIsHelpModalOpen,
    setIsSupabaseModalOpen,
    settings,
  } = useApp();

  if (!isOpen) return null;
  const isCloudConnected = isSupabaseConfigured();


  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'shop', label: 'ဆိုင် (Dashboard)', icon: <Home className="w-5 h-5" /> },
    { id: 'sales', label: 'အရောင်းကောင်တာ (POS)', icon: <ShoppingCart className="w-5 h-5" /> },
    { id: 'purchase', label: 'အဝယ်စာရင်း (Stock In)', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'edit', label: 'ပြင်ဆင်ခြင်း (Inventory)', icon: <Edit3 className="w-5 h-5" /> },
    { id: 'income_expense', label: 'ဝင်ငွေထွက်ငွေ (Ledger)', icon: <CircleDollarSign className="w-5 h-5" /> },
    { id: 'reports', label: 'စာရင်းချုပ် (Reports)', icon: <FileText className="w-5 h-5" /> },
    { id: 'setting', label: 'Setting (ဆက်တင်များ)', icon: <Settings className="w-5 h-5" /> },
    { id: 'close_shop', label: 'ဆိုင်ပိတ်ရန် (Close Day)', icon: <LogOut className="w-5 h-5" /> },
    {
      id: 'bonus',
      label: 'ဘောနပ်စ် (Bonus & Loyalty)',
      icon: (
        <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[7px] font-black">
          BONUS
        </div>
      ),
    },
  ];

  const handleSelect = (tab: NavTab) => {
    setCurrentTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative w-72 max-w-[80vw] bg-[#545b62] text-white h-full flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
        <div>
          {/* Header */}
          <div className="p-4 bg-[#43494e] border-b border-gray-600 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm text-white">{settings.shopName}</h2>
              <div className="text-[11px] text-gray-300 flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>POS v1.0.1.0.5</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-300 hover:text-white bg-gray-700/50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Staff Card */}
          <div className="p-3 mx-3 my-2 bg-white/10 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold">
                <User className="w-4 h-4 text-orange-300" />
              </div>
              <div>
                <div className="font-bold text-white">{activeStaff?.name || 'Admin'}</div>
                <div className="text-[10px] text-gray-300">{activeStaff?.role || 'Staff'} • {activeStaff?.counter}</div>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                setIsStaffModalOpen(true);
              }}
              className="text-[10px] bg-[#ff6600] text-white px-2 py-1 rounded font-semibold cursor-pointer"
            >
              ပြောင်းမည်
            </button>
          </div>

          {/* Nav Items */}
          <div className="py-2 px-2 space-y-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#ff6600] text-white shadow-xs font-bold'
                      : 'text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Supabase Box in Drawer */}
            <div className="pt-2 border-t border-gray-600">
              <button
                onClick={() => {
                  onClose();
                  setIsSupabaseModalOpen(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold bg-slate-900 text-emerald-400 border border-slate-700 hover:bg-black transition-colors cursor-pointer shadow-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span className="text-white">Supabase Cloud Box</span>
                </div>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                    isCloudConnected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {isCloudConnected ? 'Online' : 'Setup'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-600 bg-[#43494e] flex items-center justify-between text-xs text-gray-300">
          <button
            onClick={() => {
              onClose();
              setIsHelpModalOpen(true);
            }}
            className="flex items-center space-x-1 hover:text-white"
          >
            <HelpCircle className="w-4 h-4 text-[#ff6600]" />
            <span>အကူအညီ (?)</span>
          </button>
          <span className="text-[10px] text-gray-400">Mobile & PC Mode</span>
        </div>
      </div>
    </div>
  );
};
