import React, { useState } from 'react';
import { User, X, Check, KeyRound, Lock, ShieldCheck, UserCheck, Delete, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StaffUser } from '../types';

export const StaffSelectModal: React.FC = () => {
  const {
    isStaffModalOpen,
    setIsStaffModalOpen,
    staffList,
    activeStaff,
    setActiveStaff,
    loginWithPin,
    setCurrentTab,
  } = useApp();

  const [mode, setMode] = useState<'direct' | 'profile'>('direct');
  const [pinInput, setPinInput] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState(activeStaff?.id || staffList[0]?.id);
  const [errorMsg, setErrorMsg] = useState('');
  const [successStaff, setSuccessStaff] = useState<StaffUser | null>(null);

  if (!isStaffModalOpen) return null;

  const handleKeypadPress = (num: string) => {
    setErrorMsg('');
    if (pinInput.length < 8) {
      setPinInput((prev) => prev + num);
    }
  };

  const handleKeypadDelete = () => {
    setErrorMsg('');
    setPinInput((prev) => prev.slice(0, -1));
  };

  const handleKeypadClear = () => {
    setErrorMsg('');
    setPinInput('');
  };

  const handleDirectSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pinInput.trim()) {
      setErrorMsg('ကျေးဇူးပြု၍ လျှို့ဝှက်ကုဒ် (PIN) ရိုက်ထည့်ပါ');
      return;
    }

    const res = loginWithPin(pinInput);
    if (res.success && res.staff) {
      setSuccessStaff(res.staff);
      setErrorMsg('');
      setTimeout(() => {
        setSuccessStaff(null);
        setIsStaffModalOpen(false);
        setPinInput('');
      }, 900);
    } else {
      setErrorMsg(res.error || 'မှားယွင်းသော PIN Code ဖြစ်ပါသည်!');
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStaff = staffList.find((s) => s.id === selectedStaffId);
    if (!targetStaff) return;

    if (targetStaff.pin && pinInput !== targetStaff.pin) {
      setErrorMsg(`${targetStaff.name} ၏ လျှို့ဝှက်ကုဒ် (PIN) မှားယွင်းနေပါသည်!`);
      return;
    }

    setActiveStaff(targetStaff);
    setSuccessStaff(targetStaff);
    setErrorMsg('');
    setTimeout(() => {
      setSuccessStaff(null);
      setIsStaffModalOpen(false);
      setPinInput('');
    }, 900);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#ff6600] flex items-center justify-center text-white">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Admin & Staff PIN Login</h3>
              <p className="text-[11px] text-gray-300">ကိုယ်ပိုင် ကုဒ်ဖြင့် အကောင့်ပြောင်းရန်</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsStaffModalOpen(false);
              setPinInput('');
              setErrorMsg('');
            }}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active User Banner */}
        <div className="bg-amber-50/80 border-b border-amber-200/70 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-gray-600">လက်ရှိအကောင့်:</span>
            <span className="font-bold text-gray-900">{activeStaff?.name}</span>
          </div>
          <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-semibold text-[10px]">
            {activeStaff?.role}
          </span>
        </div>

        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 border-b border-gray-200 text-xs font-semibold bg-gray-50">
          <button
            type="button"
            onClick={() => {
              setMode('direct');
              setErrorMsg('');
              setPinInput('');
            }}
            className={`py-2.5 text-center cursor-pointer transition-colors border-b-2 ${
              mode === 'direct'
                ? 'border-[#ff6600] text-[#ff6600] bg-white font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            PIN Code တိုက်ရိုက်ရိုက်ရန်
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('profile');
              setErrorMsg('');
              setPinInput('');
            }}
            className={`py-2.5 text-center cursor-pointer transition-colors border-b-2 ${
              mode === 'profile'
                ? 'border-[#ff6600] text-[#ff6600] bg-white font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            အကောင့်ရွေးချယ်ရန်
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 space-y-3">
          {successStaff ? (
            <div className="py-8 text-center space-y-2 animate-in zoom-in-90">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-base text-gray-900">အောင်မြင်စွာ ဝင်ရောက်ပြီးပါပြီ!</h4>
              <p className="text-xs text-gray-600 font-medium">
                {successStaff.name} ({successStaff.role}) အဖြစ် စတင်အသုံးပြုပါမည်။
              </p>
            </div>
          ) : mode === 'direct' ? (
            /* Mode 1: Direct PIN Keypad Input */
            <div className="space-y-3">
              <div className="text-center space-y-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Admin သို့မဟုတ် Staff ၏ လျှို့ဝှက်ကုဒ် (PIN) ရိုက်ထည့်ပါ:
                </label>
                {/* PIN Display */}
                <div className="h-11 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center tracking-widest text-2xl font-mono font-bold text-gray-900 px-3">
                  {pinInput ? '•'.repeat(pinInput.length) : <span className="text-gray-400 text-xs tracking-normal font-sans">PIN Code ထည့်ပါ (Default: 1234)</span>}
                </div>
              </div>

              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded text-center text-xs font-semibold animate-in shake">
                  {errorMsg}
                </div>
              )}

              {/* Number Keypad */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadPress(digit)}
                    className="h-10 rounded-lg bg-gray-50 hover:bg-gray-200 active:bg-gray-300 text-gray-800 font-bold text-base border border-gray-200 shadow-2xs transition-colors cursor-pointer"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleKeypadClear}
                  className="h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-xs border border-gray-200 transition-colors cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="h-10 rounded-lg bg-gray-50 hover:bg-gray-200 active:bg-gray-300 text-gray-800 font-bold text-base border border-gray-200 shadow-2xs transition-colors cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleKeypadDelete}
                  className="h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center border border-gray-200 transition-colors cursor-pointer"
                >
                  <Delete className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleDirectSubmit()}
                disabled={pinInput.length === 0}
                className="w-full bg-[#ff6600] hover:bg-[#e65c00] disabled:opacity-50 text-white font-bold py-2.5 rounded-lg shadow-xs cursor-pointer flex items-center justify-center space-x-2 text-xs transition-colors mt-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>အကောင့်ဝင်ရောက်မည် (Login)</span>
              </button>
            </div>
          ) : (
            /* Mode 2: Select Profile & Enter Code */
            <form onSubmit={handleProfileSubmit} className="space-y-3 text-xs">
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {staffList.map((st) => (
                  <label
                    key={st.id}
                    onClick={() => {
                      setSelectedStaffId(st.id);
                      setErrorMsg('');
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                      selectedStaffId === st.id
                        ? 'border-[#ff6600] bg-orange-50/70 ring-1 ring-[#ff6600]'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-xs">
                        {st.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{st.name}</div>
                        <div className="text-[10px] text-gray-500">{st.role} • {st.counter}</div>
                      </div>
                    </div>
                    {selectedStaffId === st.id && (
                      <Check className="w-4 h-4 text-[#ff6600]" />
                    )}
                  </label>
                ))}
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#ff6600]" />
                  <span>ရွေးချယ်ထားသော အကောင့်၏ လျှို့ဝှက်ကုဒ် (PIN):</span>
                </label>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="PIN ရိုက်ထည့်ပါ..."
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs font-mono font-bold tracking-widest focus:outline-none focus:border-[#ff6600]"
                />
              </div>

              {errorMsg && (
                <div className="text-red-600 text-[11px] font-semibold bg-red-50 p-1.5 rounded border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold cursor-pointer"
                >
                  မပြောင်းပါ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#ff6600] hover:bg-[#e65c00] text-white font-bold cursor-pointer flex items-center space-x-1"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>အကောင့်ပြောင်းမည်</span>
                </button>
              </div>
            </form>
          )}

          {/* Quick link to Settings to Manage Codes */}
          <div className="pt-2 border-t border-gray-100 text-center">
            <button
              type="button"
              onClick={() => {
                setIsStaffModalOpen(false);
                setCurrentTab('setting');
              }}
              className="text-[11px] text-gray-500 hover:text-[#ff6600] font-semibold inline-flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <span>ကိုယ်ပိုင် Code များ ပြင်ဆင်ရန် / အသစ်ထည့်ရန် Setting သို့ သွားမည်</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
