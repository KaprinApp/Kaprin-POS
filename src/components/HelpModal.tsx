import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HelpModal: React.FC = () => {
  const { isHelpModalOpen, setIsHelpModalOpen } = useApp();

  if (!isHelpModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-5 max-w-lg w-full shadow-2xl border border-gray-200 animate-in fade-in">
        <div className="flex items-center justify-between border-b pb-2 mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xs">
              ?
            </div>
            <h3 className="font-bold text-sm text-gray-900">စနစ် အသုံးပြုနည်းနှင့် အကူအညီ</h3>
          </div>
          <button
            onClick={() => setIsHelpModalOpen(false)}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
          {/* Shortcuts */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2">
            <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-[#ff6600]" />
              <span>အဓိက ကဏ္ဍများနှင့် အသုံးပြုမှုများ:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] pt-1">
              <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-2xs">
                <span className="font-bold text-gray-900 block mb-0.5">၁။ အရောင်း (Sales POS):</span>
                <span className="text-gray-600">Barcode scan ဖတ်ခြင်း၊ လက်လီ/လက်ကား ရောင်းချခြင်းနှင့် ဘောက်ချာ ထုတ်ပေးခြင်း။</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-2xs">
                <span className="font-bold text-gray-900 block mb-0.5">၂။ အဝယ် (Purchases):</span>
                <span className="text-gray-600">ကုန်ပစ္စည်းအသစ်များ သိုလှောင်ရုံသို့ Stock In သွင်းခြင်း။</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-2xs">
                <span className="font-bold text-gray-900 block mb-0.5">၃။ စာရင်းချုပ် (Reports):</span>
                <span className="text-gray-600">နေ့စဉ် အရောင်းအဝယ်၊ အကြွေးစာရင်း၊ အသုံးစားရိတ်နှင့် အရှုံးအမြတ်များကို Excel/Print ထုတ်ယူခြင်း။</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-2xs">
                <span className="font-bold text-gray-900 block mb-0.5">၄။ ဆိုင်ပိတ်ရန် (Close Day):</span>
                <span className="text-gray-600">နေ့စဉ် ငွေစာရင်း ရှင်းတမ်းနှင့် Cashier ရှင်းတမ်း ပိတ်သိမ်းခြင်း။</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t mt-3">
          <button
            onClick={() => setIsHelpModalOpen(false)}
            className="px-4 py-1.5 rounded bg-gray-900 hover:bg-black text-white font-bold text-xs cursor-pointer"
          >
            ပိတ်မည် (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
