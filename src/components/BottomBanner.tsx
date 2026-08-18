import React from 'react';
import { PhoneCall } from 'lucide-react';

export const BottomBanner: React.FC = () => {
  return (
    <div
      id="pos-bottom-support-banner"
      className="hidden md:flex bg-[#ffd700] text-gray-900 px-4 py-1.5 items-center justify-center font-semibold text-xs md:text-sm border-t border-yellow-400 select-none shrink-0 shadow-sm"
    >
      <div className="flex items-center space-x-1.5 md:space-x-2 text-center tracking-wide flex-wrap justify-center">
        <span className="font-extrabold text-black tracking-normal">Service</span>
        <span>အတွက်မေးမြန်းလိုပါက</span>
        <span className="font-extrabold text-black underline underline-offset-2 flex items-center gap-1">
          <PhoneCall className="w-3.5 h-3.5 inline" />
          Call Center 09-777 335 000
        </span>
        <span>သို့ ရုံးချိန်အတွင်း ဆက်သွယ်နိုင်ပါသည်။</span>
      </div>
    </div>
  );
};
