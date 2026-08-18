import React, { useState } from 'react';
import { Gift, Sparkles, Check, Coins } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BonusView: React.FC = () => {
  const { customers, updateCustomer, staffList, sales } = useApp();

  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(100);
  const [successMsg, setSuccessMsg] = useState('');

  const activeCustomer = customers.find((c) => c.id === selectedCustomerId);

  const handleRedeemPoints = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer) return;
    if (pointsToRedeem <= 0 || pointsToRedeem > activeCustomer.bonusPoints) {
      alert('အမှတ် လုံလောက်မှု မရှိပါ သို့မဟုတ် မမှန်ကန်ပါ');
      return;
    }

    const discountAmount = pointsToRedeem * 10; // 1 point = 10 Ks discount
    updateCustomer(activeCustomer.id, {
      bonusPoints: activeCustomer.bonusPoints - pointsToRedeem,
    });

    setSuccessMsg(
      `${activeCustomer.name} အား ဘောနပ်စ်အမှတ် ${pointsToRedeem} pts လဲလှယ်ပေးပြီး ငွေ ${discountAmount.toLocaleString()} Ks လျှော့ဈေးခံစားခွင့် ပေးအပ်ပြီးပါပြီ။`
    );
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div id="bonus-management-view" className="flex-1 flex flex-col h-full bg-white select-none overflow-y-auto p-4 md:p-5 pb-20 md:pb-6">
      <div className="flex items-center space-x-2 border-b border-gray-200 pb-3 mb-4 shrink-0">
        <div className="w-8 h-8 rounded-full bg-[#ff6600] text-white flex items-center justify-center font-black text-xs">
          BONUS
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">ဘောနပ်စ်နှင့် Loyalty Points စီမံခန့်ခွဲမှု</h2>
          <p className="text-xs text-gray-500">ဝယ်ယူသူ ဖောက်သည် အမှတ်များနှင့် ဝန်ထမ်း အရောင်းဆုကြေး</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 flex-1">
        {/* Left: Customer Points Redemption */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-gray-800 border-b pb-2">
            <Gift className="w-4 h-4 text-[#ff6600]" />
            <span>ဝယ်ယူသူ ဖောက်သည် အမှတ်လဲလှယ်ခြင်း (Customer Point Redemption)</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">ဝယ်ယူသူ ရွေးချယ်ရန်:</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded p-2 text-xs font-medium focus:outline-none focus:border-[#ff6600]"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — (လက်ကျန်: {c.bonusPoints} Points)
                </option>
              ))}
            </select>
          </div>

          {activeCustomer && (
            <div className="bg-white border rounded p-3 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">လက်ရှိ ဘောနပ်စ်အမှတ်:</span>
                <span className="font-mono font-bold text-lg text-[#ff6600]">
                  {activeCustomer.bonusPoints} Points
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-500">
                <span>ညီမျှသော လျှော့ဈေးတန်ဖိုး:</span>
                <span className="font-mono font-semibold text-gray-800">
                  {(activeCustomer.bonusPoints * 10).toLocaleString()} Ks
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleRedeemPoints} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">လဲလှယ်လိုသော အမှတ်အရေအတွက်:</label>
              <input
                type="number"
                min="10"
                max={activeCustomer?.bonusPoints || 0}
                value={pointsToRedeem}
                onChange={(e) => setPointsToRedeem(parseInt(e.target.value) || 0)}
                className="w-full bg-white border border-gray-300 rounded p-2 text-xs font-mono font-bold focus:outline-none focus:border-[#ff6600]"
              />
            </div>

            <button
              type="submit"
              disabled={!activeCustomer || activeCustomer.bonusPoints <= 0}
              className="w-full bg-[#ff6600] hover:bg-[#e65c00] disabled:opacity-40 text-white font-bold text-xs py-2.5 rounded shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>အမှတ် လဲလှယ်ပေးမည် (Redeem Coupon)</span>
            </button>
          </form>

          {successMsg && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs font-semibold flex items-start space-x-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Right: Staff Commission Incentive Breakdown */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-gray-800 border-b pb-2">
            <Coins className="w-4 h-4 text-blue-600" />
            <span>တာဝန်ကျ Cashier / ဝန်ထမ်း အရောင်းကော်မရှင် (Staff Commission)</span>
          </div>

          <div className="space-y-2 text-xs">
            {staffList.map((st) => {
              const staffSales = sales.filter((s) => s.cashier === st.name);
              const totalAmount = staffSales.reduce((sum, s) => sum + s.totalAmount, 0);
              const commission = Math.round(totalAmount * 0.02); // 2% commission

              return (
                <div key={st.id} className="bg-white border rounded p-3 flex justify-between items-center shadow-xs">
                  <div>
                    <div className="font-bold text-gray-900">{st.name}</div>
                    <div className="text-[11px] text-gray-500">{st.role} • {st.counter}</div>
                    <div className="text-[11px] text-gray-600 mt-1">
                      စုစုပေါင်း အရောင်းဘောက်ချာ: <span className="font-mono font-bold">{staffSales.length}</span> ခု ({totalAmount.toLocaleString()} Ks)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-500 font-semibold">ရရှိမည့် ကော်မရှင် (2%)</div>
                    <div className="font-mono font-bold text-sm text-emerald-600">
                      {commission.toLocaleString()} Ks
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
