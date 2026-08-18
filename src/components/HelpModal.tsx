import React from 'react';
import { HelpCircle, X, PhoneCall, Keyboard, FileText, CheckCircle } from 'lucide-react';
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
          <div className="bg-gray-50 p-3 rounded border border-gray-200 space-y-2">
            <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-[#ff6600]" />
              <span>အဓိက ကဏ္ဍများနှင့် အသုံးပြုမှုများ:</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="font-bold text-gray-800">၁။ အရောင်း (Sales POS):</span> Barcode scan ဖတ်ခြင်း၊ လက်လီ/လက်ကား ရောင်းချခြင်းနှင့် ဘောက်ချာ ထုတ်ပေးခြင်း။
              </div>
              <div>
                <span className="font-bold text-gray-800">၂။ အဝယ် (Purchases):</span> ကုန်ပစ္စည်းအသစ်များ သိုလှောင်ရုံသို့ Stock In သွင်းခြင်း။
              </div>
              <div>
                <span className="font-bold text-gray-800">၃။ စာရင်းချုပ် (Reports):</span> နေ့စဉ် အရောင်းအဝယ်၊ အကြွေးစာရင်း၊ အသုံးစားရိတ်နှင့် အရှုံးအမြတ်များကို Excel/Print ထုတ်ယူခြင်း။
              </div>
              <div>
                <span className="font-bold text-gray-800">၄။ ဆိုင်ပိတ်ရန် (Close Day):</span> နေ့စဉ် ငွေစာရင်း ရှင်းတမ်းနှင့် Cashier ရှင်းတမ်း ပိတ်သိမ်းခြင်း။
              </div>
            </div>
          </div>

          {/* Support Info */}
          <div className="bg-yellow-50 border border-yellow-300 p-3 rounded flex items-center justify-between text-yellow-950">
            <div>
              <div className="font-bold text-xs flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5 text-black" />
                <span>Customer Support Call Center</span>
              </div>
              <div className="text-[11px] font-mono font-black text-black text-sm mt-0.5">
                09-777 335 000
              </div>
              <div className="text-[10px] text-yellow-800">ရုံးချိန်: မနက် ၉ နာရီ မှ ညနေ ၆ နာရီအတွင်း</div>
            </div>
            <div className="text-right text-[10px] text-yellow-900">
              POS System Version<br /><span className="font-mono font-bold">v1.0.1.0.5</span>
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
