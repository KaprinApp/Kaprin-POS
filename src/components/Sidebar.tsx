import React from 'react';
import {
  Home,
  ShoppingCart,
  ShoppingBag,
  Edit3,
  CircleDollarSign,
  FileText,
  Settings,
  LogOut,
  Database,
} from 'lucide-react';
import { NavTab } from '../types';
import { useApp } from '../context/AppContext';
import { isSupabaseConfigured } from '../lib/supabase';

export const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab, setIsSupabaseModalOpen } = useApp();
  const isCloudConnected = isSupabaseConfigured();


  const navItems: { id: NavTab; label: string; icon: React.ReactNode; isCustomIcon?: boolean }[] = [
    {
      id: 'shop',
      label: 'ဆိုင်',
      icon: <Home className="w-6 h-6" />,
    },
    {
      id: 'sales',
      label: 'အရောင်း',
      icon: <ShoppingCart className="w-6 h-6" />,
    },
    {
      id: 'purchase',
      label: 'အဝယ်',
      icon: <ShoppingBag className="w-6 h-6" />,
    },
    {
      id: 'edit',
      label: 'ပြင်ဆင်ခြင်း',
      icon: <Edit3 className="w-6 h-6" />,
    },
    {
      id: 'income_expense',
      label: 'ဝင်ငွေထွက်ငွေ',
      icon: <CircleDollarSign className="w-6 h-6" />,
    },
    {
      id: 'reports',
      label: 'စာရင်းချုပ်',
      icon: <FileText className="w-6 h-6" />,
    },
    {
      id: 'setting',
      label: 'Setting',
      icon: <Settings className="w-6 h-6" />,
    },
    {
      id: 'close_shop',
      label: 'ဆိုင်ပိတ်ရန်',
      icon: <LogOut className="w-6 h-6" />,
    },
    {
      id: 'bonus',
      label: 'ဘောနပ်-',
      icon: (
        <div className="w-7 h-7 rounded-full border border-white/70 flex items-center justify-center text-[8px] font-black tracking-tight text-white">
          BONUS
        </div>
      ),
      isCustomIcon: true,
    },
  ];

  return (
    <aside
      id="main-sidebar"
      className="hidden md:flex w-28 bg-[#545b62] text-white flex-col items-stretch shrink-0 select-none shadow-md z-30 overflow-y-auto"
    >
      <div className="flex flex-col py-1 space-y-1">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full py-2.5 px-1 flex flex-col items-center justify-center transition-colors relative cursor-pointer group ${
                isActive
                  ? 'bg-[#ff6600] text-white font-bold shadow-inner'
                  : 'hover:bg-[#43494e] text-gray-200'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full border flex items-center justify-center mb-1 transition-transform group-hover:scale-105 ${
                  isActive
                    ? 'border-white bg-white/20'
                    : 'border-gray-300/60 bg-white/5'
                }`}
              >
                {item.icon}
              </div>
              <span className="text-[12px] font-medium leading-tight text-center tracking-normal px-0.5">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Supabase Box Direct Trigger in Sidebar */}
        <div className="pt-2 mt-2 border-t border-gray-600/60 px-1">
          <button
            id="nav-btn-supabase-modal"
            onClick={() => setIsSupabaseModalOpen(true)}
            className="w-full py-2 px-1 flex flex-col items-center justify-center rounded-lg bg-slate-900 hover:bg-black text-emerald-400 border border-slate-700 transition-colors cursor-pointer group shadow-xs"
            title="Supabase Cloud Database Box ဖွင့်ရန်"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <Database className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-white leading-tight text-center">
              Supabase
            </span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold mt-0.5 ${
                isCloudConnected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {isCloudConnected ? 'Online' : 'Setup'}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};
