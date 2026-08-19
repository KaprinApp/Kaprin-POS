import React, { useState } from 'react';
import { CircleDollarSign, Plus, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const IncomeExpenseView: React.FC = () => {
  const { incomes, expenses, addIncomeRecord, addExpenseRecord, activeStaff } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Utilities');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank'>('Cash');
  const [remark, setRemark] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || amount <= 0) {
      alert('ကျေးဇူးပြု၍ ခေါင်းစဉ်နှင့် ငွေပမာဏ ဖြည့်သွင်းပါ');
      return;
    }

    const today = new Date();
    const formattedDate = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;

    if (formType === 'income') {
      addIncomeRecord({
        date: formattedDate,
        title,
        category,
        amount,
        paymentMethod,
        cashier: activeStaff?.name || 'Admin',
        remark,
      });
    } else {
      addExpenseRecord({
        date: formattedDate,
        title,
        category,
        amount,
        paymentMethod,
        cashier: activeStaff?.name || 'Admin',
        remark,
      });
    }

    setTitle('');
    setAmount(0);
    setRemark('');
  };

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div id="income-expense-view" className="flex-1 flex flex-col md:flex-row h-full bg-[#f8f9fa] overflow-y-auto select-none pb-20 md:pb-0">
      {/* Left: Add Income / Expense Form */}
      <div className="w-full md:w-80 lg:w-96 bg-white border-b md:border-b-0 md:border-r border-gray-300 p-4 shrink-0 flex flex-col justify-between overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="flex items-center space-x-2 border-b pb-2">
            <CircleDollarSign className="w-5 h-5 text-[#ff6600]" />
            <h2 className="font-bold text-sm text-gray-900">ဝင်ငွေ / ထွက်ငွေ ထည့်သွင်းရန်</h2>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormType('income')}
              className={`p-2 rounded font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer transition-colors ${
                formType === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ArrowDownCircle className="w-3.5 h-3.5" />
              <span>ဝင်ငွေ (Income)</span>
            </button>
            <button
              type="button"
              onClick={() => setFormType('expense')}
              className={`p-2 rounded font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer transition-colors ${
                formType === 'expense'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ArrowUpCircle className="w-3.5 h-3.5" />
              <span>ထွက်ငွေ (Expense)</span>
            </button>
          </div>

          <div>
            <label className="block font-semibold mb-1">ခေါင်းစဉ် / အကြောင်းအရာ:</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ဥပမာ: မီတာခ၊ ဆိုင်သုံးပစ္စည်း၊ ကြွေးပြန်ရငွေ..."
              className="w-full border border-gray-300 rounded p-1.5 focus:outline-none focus:border-[#ff6600]"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">အမျိုးအစား (Category):</label>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded p-1.5 focus:outline-none focus:border-[#ff6600]"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">ငွေပမာဏ (Amount Ks):</label>
            <input
              type="number"
              required
              min="1"
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full border border-gray-300 rounded p-1.5 font-mono font-bold text-sm focus:outline-none focus:border-[#ff6600]"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">ငွေပေးချေမှု နည်းလမ်း:</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as 'Cash' | 'Bank')}
              className="w-full border border-gray-300 rounded p-1.5 text-gray-800 focus:outline-none focus:border-[#ff6600]"
            >
              <option value="Cash">Cash (လက်ငင်းငွေသား)</option>
              <option value="Bank">Bank (KBZPay / Wave / AYA / CB)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">မှတ်ချက် (Remark):</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded p-1.5 focus:outline-none focus:border-[#ff6600]"
              placeholder="အသေးစိတ်မှတ်ချက်..."
            />
          </div>

          <button
            type="submit"
            className={`w-full text-white font-bold py-2 rounded shadow-xs cursor-pointer flex items-center justify-center space-x-1.5 mt-2 ${
              formType === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{formType === 'income' ? 'ဝင်ငွေ မှတ်တမ်းတင်မည်' : 'ထွက်ငွေ မှတ်တမ်းတင်မည်'}</span>
          </button>
        </form>

        {/* Summary Card */}
        <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs space-y-1.5 mt-4">
          <div className="flex justify-between">
            <span className="text-gray-600">စုစုပေါင်း ဝင်ငွေ:</span>
            <span className="font-mono font-bold text-emerald-600">{totalIncome.toLocaleString()} Ks</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">စုစုပေါင်း ထွက်ငွေ:</span>
            <span className="font-mono font-bold text-red-600">{totalExpense.toLocaleString()} Ks</span>
          </div>
          <div className="flex justify-between font-bold border-t pt-1">
            <span className="text-gray-800">ကျန်ငွေ ကွာခြားချက်:</span>
            <span className="font-mono text-gray-900">{(totalIncome - totalExpense).toLocaleString()} Ks</span>
          </div>
        </div>
      </div>

      {/* Right: Transactions List */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-3 md:p-4">
        <div className="bg-white rounded border border-gray-200 shadow-xs flex-1 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                  activeTab === 'all' ? 'bg-[#545b62] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                အားလုံး
              </button>
              <button
                onClick={() => setActiveTab('income')}
                className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                  activeTab === 'income' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ဝင်ငွေများ
              </button>
              <button
                onClick={() => setActiveTab('expense')}
                className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                  activeTab === 'expense' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ထွက်ငွေများ
              </button>
            </div>
            <span className="text-xs text-gray-500 font-mono">Date: 08/14/2026</span>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-gray-200 text-gray-700 font-bold border-b">
                  <th className="p-2 border-r text-center">စဉ်</th>
                  <th className="p-2 border-r">အမျိုးအစား</th>
                  <th className="p-2 border-r">ရက်စွဲ</th>
                  <th className="p-2 border-r">ခေါင်းစဉ် / အကြောင်းအရာ</th>
                  <th className="p-2 border-r text-right">ငွေပမာဏ (Ks)</th>
                  <th className="p-2 border-r text-center">ပုံစံ</th>
                  <th className="p-2 border-r">တာဝန်ခံ</th>
                  <th className="p-2">မှတ်ချက်</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'all' || activeTab === 'income') &&
                  incomes.map((inc, i) => (
                    <tr key={inc.id} className="border-b bg-emerald-50/40 hover:bg-emerald-50 transition-colors">
                      <td className="p-2 text-center text-gray-500">{i + 1}</td>
                      <td className="p-2 font-bold text-emerald-700">ဝင်ငွေ (Income)</td>
                      <td className="p-2 font-mono text-gray-800">{inc.date}</td>
                      <td className="p-2 font-semibold text-gray-900">{inc.title}</td>
                      <td className="p-2 text-right font-mono font-bold text-emerald-700">
                        +{inc.amount.toLocaleString()}
                      </td>
                      <td className="p-2 text-center text-gray-600">{inc.paymentMethod}</td>
                      <td className="p-2 text-gray-700">{inc.cashier}</td>
                      <td className="p-2 text-gray-500">{inc.remark}</td>
                    </tr>
                  ))}

                {(activeTab === 'all' || activeTab === 'expense') &&
                  expenses.map((exp, i) => (
                    <tr key={exp.id} className="border-b bg-red-50/40 hover:bg-red-50 transition-colors">
                      <td className="p-2 text-center text-gray-500">{i + 1}</td>
                      <td className="p-2 font-bold text-red-700">ထွက်ငွေ (Expense)</td>
                      <td className="p-2 font-mono text-gray-800">{exp.date}</td>
                      <td className="p-2 font-semibold text-gray-900">{exp.title}</td>
                      <td className="p-2 text-right font-mono font-bold text-red-700">
                        -{exp.amount.toLocaleString()}
                      </td>
                      <td className="p-2 text-center text-gray-600">{exp.paymentMethod}</td>
                      <td className="p-2 text-gray-700">{exp.cashier}</td>
                      <td className="p-2 text-gray-500">{exp.remark}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
