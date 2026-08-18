import React, { useState } from 'react';
import { Sliders, X, Check, Printer } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PrintSettingsModal: React.FC = () => {
  const { isPrintSettingsOpen, setIsPrintSettingsOpen, settings, setSettings } = useApp();
  const [printerType, setPrinterType] = useState(settings.printerType);
  const [autoPrint, setAutoPrint] = useState(settings.autoPrint);

  if (!isPrintSettingsOpen) return null;

  const handleSave = () => {
    setSettings((prev) => ({
      ...prev,
      printerType,
      autoPrint,
    }));
    setIsPrintSettingsOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-5 max-w-sm w-full shadow-2xl border border-gray-200 animate-in fade-in">
        <div className="flex items-center justify-between border-b pb-2 mb-3">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-[#ff6600]" />
            <h3 className="font-bold text-sm text-gray-900">Print Setting (ပြေစာ ပုံနှိပ်စက် ဆက်တင်)</h3>
          </div>
          <button
            onClick={() => setIsPrintSettingsOpen(false)}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Paper & Printer Type:</label>
            <select
              value={printerType}
              onChange={(e) => setPrinterType(e.target.value as any)}
              className="w-full bg-white border border-gray-300 rounded p-2 text-xs"
            >
              <option value="80mm">Thermal 80mm (Standard POS Receipt)</option>
              <option value="58mm">Thermal 58mm (Mini Receipt)</option>
              <option value="A4">A4 Standard Sheet / Invoice</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Auto Print on Checkout:</label>
            <select
              value={autoPrint ? 'true' : 'false'}
              onChange={(e) => setAutoPrint(e.target.value === 'true')}
              className="w-full bg-white border border-gray-300 rounded p-2 text-xs"
            >
              <option value="true">ဖွင့်ထားမည် (အလိုအလျောက် ပရင့်ထုတ်ရန်)</option>
              <option value="false">ပိတ်ထားမည် (ကိုယ်တိုင်ရွေးချယ်ထုတ်ရန်)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-3 border-t mt-4">
          <button
            onClick={() => setIsPrintSettingsOpen(false)}
            className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold cursor-pointer"
          >
            မပြောင်းပါ
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded bg-[#ff6600] hover:bg-[#e65c00] text-white font-bold cursor-pointer"
          >
            သိမ်းဆည်းမည်
          </button>
        </div>
      </div>
    </div>
  );
};
