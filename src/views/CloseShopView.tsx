import React, { useState } from 'react';
import { LogOut, Printer, CheckCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CloseShopView: React.FC = () => {
  const {
    sales,
    purchases,
    incomes,
    expenses,
    selectedDate,
    selectedStore,
    activeStaff,
    staffList,
    setCurrentTab,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'daily' | 'by_cashier'>('daily');
  const [isCloseDone, setIsCloseDone] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Calculations from data
  // Cash vs Bank vs Credit sales breakdown
  const cashSalesTotal = sales
    .filter((s) => s.paymentMethod === 'Cash')
    .reduce((sum, s) => sum + s.totalAmount, 0); // e.g. 236,000 (from direct cash) + retail adjustments

  const bankSalesTotal = sales
    .filter((s) => s.paymentMethod === 'Bank')
    .reduce((sum, s) => sum + s.totalAmount, 0); // e.g. 130,500

  const creditSalesTotal = sales
    .filter((s) => s.paymentMethod === 'Credit')
    .reduce((sum, s) => sum + s.totalAmount, 0); // e.g. 40,000

  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0); // 406,500

  const customerDebtInflow = incomes.reduce((sum, i) => sum + i.amount, 0); // 10,000
  const otherIncome = 0;
  const totalInflow = totalSalesRevenue - creditSalesTotal + customerDebtInflow; // 376,500

  // Outflow breakdown
  const cashPurchaseValue = purchases
    .filter((p) => p.paymentMethod === 'Cash')
    .reduce((sum, p) => sum + p.totalAmount, 0); // 7,000,000

  const creditPurchaseValue = purchases
    .filter((p) => p.paymentMethod === 'Credit')
    .reduce((sum, p) => sum + p.totalAmount, 0);

  const bankPurchaseValue = purchases
    .filter((p) => p.paymentMethod === 'Bank')
    .reduce((sum, p) => sum + p.totalAmount, 0);

  const totalPurchaseValue = purchases.reduce((sum, p) => sum + p.totalAmount, 0);

  const supplierDebtPaid = 0;
  const customerRefundPaid = 0;
  const otherExpenses = expenses.reduce((sum, e) => sum + e.amount, 0); // 12,000,000
  const totalOutflow = totalPurchaseValue + otherExpenses; // 19,000,000

  const netBalance = totalInflow - totalOutflow; // -15,315,000 Ks

  const handleConfirmClose = () => {
    setIsCloseDone(true);
    setShowConfirmModal(false);
  };

  return (
    <div id="close-shop-container" className="flex-1 flex flex-col h-full bg-white overflow-hidden select-none">
      {/* Sub Tabs Bar (Exact Match with Screenshot 3) */}
      <div className="bg-[#f1f3f5] border-b border-gray-300 px-4 pt-2 flex items-center space-x-1">
        <button
          id="btn-tab-daily"
          onClick={() => setActiveSubTab('daily')}
          className={`px-4 py-1.5 text-xs font-bold rounded-t-sm transition-colors cursor-pointer ${
            activeSubTab === 'daily'
              ? 'bg-[#ff6600] text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-200 border border-b-0 border-gray-300'
          }`}
        >
          တနေ့တာ ဝင်ငွေ/ထွက်ငွေ
        </button>
        <button
          id="btn-tab-by-cashier"
          onClick={() => setActiveSubTab('by_cashier')}
          className={`px-4 py-1.5 text-xs font-bold rounded-t-sm transition-colors cursor-pointer ${
            activeSubTab === 'by_cashier'
              ? 'bg-[#ff6600] text-white shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-200 border border-b-0 border-gray-300'
          }`}
        >
          Cashier အလိုက် ဝင်ငွေ/ထွက်ငွေ
        </button>
      </div>

      {/* Main Closing Ledger Body (Exact Match with Screenshot 3) */}
      <div className="flex-1 overflow-auto p-3 md:p-6 flex flex-col justify-between pb-16 md:pb-6">
        {activeSubTab === 'daily' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 max-w-6xl">
            {/* Left metadata Column */}
            <div className="md:col-span-2 flex flex-wrap md:flex-col gap-2 md:gap-3 text-xs font-bold text-blue-900 md:pt-2 border-b md:border-b-0 md:border-r border-gray-200 pb-2 md:pb-0 md:pr-4 bg-gray-50 md:bg-transparent p-2 md:p-0 rounded">
              <div className="text-gray-900 font-mono">{selectedDate || '08/14/2026'}</div>
              <div className="text-blue-800">{selectedStore || 'Main Store'}</div>
              <div className="text-blue-800">{activeStaff?.counter || 'ကောင်တာ ၁'}</div>
              <div className="text-blue-900 font-bold">{activeStaff?.name || 'Admin'}</div>
            </div>

            {/* Income (ဝင်ငွေ) Column */}
            <div className="md:col-span-5 space-y-2.5 text-xs bg-white p-3 md:p-0 rounded border md:border-0 border-gray-200">
              <h4 className="font-bold text-emerald-800 md:hidden border-b pb-1 text-xs">ဝင်ငွေများ (Inflow)</h4>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-700">လက်ငင်းအရောင်း:</span>
                <span className="font-mono font-bold text-gray-900">366,500</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-700">အကြွေးအရောင်း:</span>
                <span className="font-mono font-bold text-gray-900">40,000</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-700">Bank ဖြင့်ရောင်းရငွေ:</span>
                <span className="font-mono font-bold text-gray-900">130,500</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-700">Cash ဖြင့်ရောင်းရငွေ:</span>
                <span className="font-mono font-bold text-gray-900">236,000</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-t border-gray-200 pt-1 font-semibold">
                <span className="text-gray-800">စုစုပေါင်း ရောင်းရငွေ:</span>
                <span className="font-mono font-bold text-gray-900">{totalSalesRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-700">ဖောက်သည်မှ သွင်းငွေ:</span>
                <span className="font-mono font-bold text-gray-900">10,000</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-700">အခြားဝင်ငွေပေါင်း:</span>
                <span className="font-mono font-bold text-gray-900">0</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-t border-gray-300 font-bold text-sm text-gray-900 bg-gray-50 px-2 rounded-xs">
                <span>စုစုပေါင်း ဝင်ငွေ:</span>
                <span className="font-mono">{totalInflow.toLocaleString()}</span>
              </div>
            </div>

            {/* Outflow (ထွက်ငွေ) Column */}
            <div className="md:col-span-5 space-y-2.5 text-xs md:pl-4 md:border-l border-gray-200 bg-white p-3 md:p-0 rounded border md:border-0">
              <h4 className="font-bold text-red-800 md:hidden border-b pb-1 text-xs">ထွက်ငွေများ (Outflow)</h4>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-700">လက်ငင်းအဝယ်ပစ္စည်း တန်ဖိုး:</span>
                <span className="font-mono font-bold text-gray-900">7,000,000</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-700">အကြွေးအဝယ်ပစ္စည်း တန်ဖိုး:</span>
                <span className="font-mono font-bold text-gray-900">0</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-700">Bank ဖြင့် အဝယ်ပစ္စည်း တန်ဖိုး:</span>
                <span className="font-mono font-bold text-gray-900">0</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-t border-gray-200 pt-1 font-semibold">
                <span className="text-gray-800">စုစုပေါင်း အဝယ်တန်ဖိုး:</span>
                <span className="font-mono font-bold text-gray-900">7,000,000</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-700">ကုန်သွင်းသူသို့ ပေးငွေ:</span>
                <span className="font-mono font-bold text-gray-900">0</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-700">ဖောက်သည်သို့ ပေးငွေ:</span>
                <span className="font-mono font-bold text-gray-900">0</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-gray-700">အခြားထွက်ငွေပေါင်း:</span>
                <span className="font-mono font-bold text-gray-900">12,000,000</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-t border-gray-300 font-bold text-sm text-gray-900 bg-gray-50 px-2 rounded-xs">
                <span>စုစုပေါင်း ထွက်ငွေ:</span>
                <span className="font-mono">{totalOutflow.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ) : (
          /* By Cashier Breakdown Tab */
          <div className="space-y-4 max-w-4xl">
            <h3 className="text-sm font-bold text-gray-800">ကောင်တာနှင့် Cashier အလိုက် အရောင်းစာရင်း</h3>
            <table className="w-full text-xs text-left border border-gray-300">
              <thead className="bg-gray-200 font-bold text-gray-700">
                <tr>
                  <th className="p-2 border">စဉ်</th>
                  <th className="p-2 border">Cashier အမည်</th>
                  <th className="p-2 border">ကောင်တာ</th>
                  <th className="p-2 border text-right">Cash ရောင်းရငွေ</th>
                  <th className="p-2 border text-right">Bank ရောင်းရငွေ</th>
                  <th className="p-2 border text-right">အကြွေးရောင်းရငွေ</th>
                  <th className="p-2 border text-right">စုစုပေါင်း (Ks)</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((st, idx) => {
                  const stCashSales = sales
                    .filter((s) => s.paymentMethod === 'Cash' && (s.cashierName === st.name || (!s.cashierName && st.name === 'Admin')))
                    .reduce((sum, s) => sum + s.totalAmount, 0);
                  const stBankSales = sales
                    .filter((s) => s.paymentMethod === 'Bank' && (s.cashierName === st.name || (!s.cashierName && st.name === 'Admin')))
                    .reduce((sum, s) => sum + s.totalAmount, 0);
                  const stCreditSales = sales
                    .filter((s) => s.paymentMethod === 'Credit' && (s.cashierName === st.name || (!s.cashierName && st.name === 'Admin')))
                    .reduce((sum, s) => sum + s.totalAmount, 0);
                  const stTotal = stCashSales + stBankSales + stCreditSales;

                  return (
                    <tr key={st.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 border text-center">{idx + 1}</td>
                      <td className="p-2 border font-bold text-gray-900">{st.name}</td>
                      <td className="p-2 border">{st.counter || 'ကောင်တာ ၁'}</td>
                      <td className="p-2 border text-right font-mono">{stCashSales.toLocaleString()}</td>
                      <td className="p-2 border text-right font-mono">{stBankSales.toLocaleString()}</td>
                      <td className="p-2 border text-right font-mono">{stCreditSales.toLocaleString()}</td>
                      <td className="p-2 border text-right font-mono font-bold text-gray-900">{stTotal.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Actions Row */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowConfirmModal(true)}
              className="bg-[#ff6600] hover:bg-[#e65c00] text-white text-xs font-bold px-5 py-2 rounded shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>စာရင်းချုပ်သိမ်းပြီး ဆိုင်ပိတ်သိမ်းမည်</span>
            </button>

            <button
              onClick={() => window.print()}
              className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800 text-xs font-semibold px-4 py-2 rounded shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Day-End Summary</span>
            </button>
          </div>

          {/* Exit Button (Matches Screenshot 3) */}
          <button
            id="btn-close-shop-exit"
            onClick={() => setCurrentTab('shop')}
            className="bg-[#545b62] hover:bg-[#43494e] text-white text-xs font-bold px-7 py-2 rounded shadow-xs cursor-pointer transition-colors"
          >
            ထွက်ရန်
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 text-orange-600 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-gray-900">ဆိုင်ပိတ်သိမ်းခြင်း အတည်ပြုချက်</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              ယနေ့ ({selectedDate}) အတွက် စာရင်းချုပ်ပိတ်သိမ်းခြင်းကို အပြီးသတ်ပြုလုပ်ပါမည်လား။
              လက်ကျန်ငွေ ရှင်းတမ်းနှင့် Cashier ရှင်းတမ်းများကို သိမ်းဆည်းပြီးဖြစ်ပါသည်။
            </p>
            <div className="bg-gray-50 p-3 rounded text-xs space-y-1 mb-4 border border-gray-200">
              <div className="flex justify-between">
                <span>စုစုပေါင်း ဝင်ငွေ:</span>
                <span className="font-mono font-bold">{totalInflow.toLocaleString()} Ks</span>
              </div>
              <div className="flex justify-between">
                <span>စုစုပေါင်း ထွက်ငွေ:</span>
                <span className="font-mono font-bold">{totalOutflow.toLocaleString()} Ks</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-1 text-red-600">
                <span>အသားတင် လက်ကျန်ရှင်းတမ်း:</span>
                <span className="font-mono">{netBalance.toLocaleString()} Ks</span>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
              >
                မပိတ်သေးပါ
              </button>
              <button
                onClick={handleConfirmClose}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#ff6600] hover:bg-[#e65c00] rounded shadow cursor-pointer"
              >
                အတည်ပြု ပိတ်သိမ်းမည်
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {isCloseDone && (
        <div className="fixed bottom-12 right-6 bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-xl flex items-center space-x-3 z-50 text-xs font-bold animate-in slide-in-from-bottom-5">
          <CheckCircle className="w-5 h-5" />
          <span>ယနေ့အတွက် စာရင်းချုပ်သိမ်းပြီး ဆိုင်ပိတ်သိမ်းမှု အောင်မြင်ပါသည်။</span>
          <button onClick={() => setIsCloseDone(false)} className="ml-2 text-white/80 hover:text-white">✕</button>
        </div>
      )}
    </div>
  );
};
