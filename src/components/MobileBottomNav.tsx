import React from 'react';
import {
  Home,
  ShoppingCart,
  ShoppingBag,
  FileText,
  Menu,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NavTab } from '../types';

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMenu }) => {
  const { currentTab, setCurrentTab } = useApp();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'shop',
      label: 'ဆိုင်',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'sales',
      label: 'အရောင်း',
      icon: <ShoppingCart className="w-5 h-5" />,
    },
    {
      id: 'purchase',
      label: 'အဝယ်',
      icon: <ShoppingBag className="w-5 h-5" />,
    },
    {
      id: 'reports',
      label: 'စာရင်းချုပ်',
      icon: <FileText className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      id="mobile-bottom-nav"
      className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around py-1.5 px-2 shadow-lg select-none"
    >
      {navItems.map((item) => {
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            id={`mobile-nav-${item.id}`}
            onClick={() => setCurrentTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all cursor-pointer ${
              isActive
                ? 'text-[#ff6600] font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className={`p-1 rounded-full ${isActive ? 'bg-orange-50' : ''}`}>
              {item.icon}
            </div>
            <span className="text-[11px] mt-0.5 leading-none">{item.label}</span>
          </button>
        );
      })}

      {/* More / Menu Drawer trigger */}
      <button
        id="mobile-nav-more"
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-lg text-gray-600 hover:text-gray-900 cursor-pointer"
      >
        <div className="p-1 rounded-full">
          <Menu className="w-5 h-5" />
        </div>
        <span className="text-[11px] mt-0.5 leading-none">အခြား</span>
      </button>
    </nav>
  );
};
