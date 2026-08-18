import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Sliders,
  Calendar,
  CornerDownLeft,
  ChevronDown,
  Search,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ReportSubTab, SaleRecord, PurchaseRecord } from '../types';

export const ReportsView: React.FC = () => {
  const {
    sales,
    purchases,
    expenses,
    incomes,
    customers,
    suppliers,
    reportSubTab,
    setReportSubTab,
    selectedStore,
    setSelectedStore,
    setIsPrintSettingsOpen,
  } = useApp();

  // Mode: 'sales' (အရောင်းစာရင်း) or 'purchase' (အဝယ်စာရင်း)
  const [recordMode, setRecordMode] = useState<'sales' | 'purchase'>('sales');
  const [selectedRowId, setSelectedRowId] = useState<string | null>('sale-1');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [saleTypeFilter, setSaleTypeFilter] = useState<string>('Type 1'); // 'Type 1' shows all or specific filter
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('8/14/2026');
  const [toDate, setToDate] = useState<string>('8/14/2026');

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter((item) => {
      if (categoryFilter !== 'All' && item.category !== categoryFilter) {
        return false;
      }
      if (saleTypeFilter === 'လက်လီ' && item.saleType !== 'လက်လီ') return false;
      if (saleTypeFilter === 'လက်ကား ၁' && item.saleType !== 'လက်ကား ၁') return false;
      if (saleTypeFilter === 'လက်ကား ၂' && item.saleType !== 'လက်ကား ၂') return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchName = item.itemName.toLowerCase().includes(query);
        const matchBarcode = item.barcode.toLowerCase().includes(query);
        const matchVoucher = item.voucherNo.toLowerCase().includes(query);
        if (!matchName && !matchBarcode && !matchVoucher) return false;
      }
      return true;
    });
  }, [sales, categoryFilter, saleTypeFilter, searchTerm]);

  // Filtered purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter((item) => {
      if (categoryFilter !== 'All' && item.category !== categoryFilter) {
        return false;
      }
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchName = item.itemName.toLowerCase().includes(query);
        const matchBarcode = item.barcode.toLowerCase().includes(query);
        const matchVoucher = item.voucherNo.toLowerCase().includes(query);
        if (!matchName && !matchBarcode && !matchVoucher) return false;
      }
      return true;
    });
  }, [purchases, categoryFilter, searchTerm]);

  // Totals for sales
  const totalSalesQty = filteredSales.reduce((sum, item) => sum + item.qty, 0);
  const totalSalesDiscount = filteredSales.reduce((sum, item) => sum + item.discount, 0);
  const totalSalesAmount = filteredSales.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalGrossProfit = filteredSales.reduce((sum, item) => sum + item.grossProfit, 0);

  // Totals for purchases
  const totalPurchasesQty = filteredPurchases.reduce((sum, item) => sum + item.qty, 0);
  const totalPurchasesAmount = filteredPurchases.reduce((sum, item) => sum + item.totalAmount, 0);

  // Categories list
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    sales.forEach((s) => set.add(s.category));
    purchases.forEach((p) => set.add(p.category));
    return ['All', ...Array.from(set)];
  }, [sales, purchases]);

  // CSV Export function
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (reportSubTab === 'sales_purchase') {
      if (recordMode === 'sales') {
        headers = ['No', 'Date', 'Voucher', 'Barcode', 'Item Name', 'Category', 'Qty', 'Unit', 'Price', 'Discount', 'Total Amount', 'Gross Profit', 'Sale Type'];
        rows = filteredSales.map((s, i) => [
          String(i + 1),
          s.date,
          s.voucherNo,
          s.barcode,
          `"${s.itemName}"`,
          s.category,
          s.qty.toFixed(2),
          s.unit,
          String(s.unitPrice),
          String(s.discount),
          String(s.totalAmount),
          String(s.grossProfit),
          s.saleType,
        ]);
      } else {
        headers = ['No', 'Date', 'Voucher', 'Barcode', 'Item Name', 'Category', 'Qty', 'Unit', 'Buy Price', 'Total Amount', 'Store', 'Supplier'];
        rows = filteredPurchases.map((p, i) => [
          String(i + 1),
          p.date,
          p.voucherNo,
          p.barcode,
          `"${p.itemName}"`,
          p.category,
          p.qty.toFixed(2),
          p.unit,
          String(p.buyPrice),
          String(p.totalAmount),
          p.store,
          p.supplier,
        ]);
      }
    } else if (reportSubTab === 'receivable_payable') {
      headers = ['Type', 'Name', 'Phone', 'Address', 'Balance (Ks)'];
      rows = [
        ...customers.map((c) => ['Customer Credit (ရရန်ရှိ)', `"${c.name}"`, c.phone, `"${c.address}"`, String(c.creditBalance)]),
        ...suppliers.map((s) => ['Supplier Debt (ပေးရန်ရှိ)', `"${s.name}"`, s.phone, `"${s.address}"`, String(s.debtBalance)]),
      ];
    } else if (reportSubTab === 'expenses') {
      headers = ['No', 'Date', 'Title', 'Category', 'Amount (Ks)', 'Payment Method', 'Cashier', 'Remark'];
      rows = expenses.map((e, i) => [
        String(i + 1),
        e.date,
        `"${e.title}"`,
        e.category,
        String(e.amount),
        e.paymentMethod,
        e.cashier,
        `"${e.remark}"`,
      ]);
    } else if (reportSubTab === 'profit_loss') {
      const totalSalesRev = sales.reduce((sum, s) => sum + s.totalAmount, 0);
      const totalProfit = sales.reduce((sum, s) => sum + s.grossProfit, 0);
      const totalExp = expenses.reduce((sum, e) => sum + e.amount, 0);
      const netProfit = totalProfit - totalExp;
      headers = ['Metric', 'Amount (Ks)'];
      rows = [
        ['Total Sales (ရောင်းရငွေ)', String(totalSalesRev)],
        ['Gross Profit (အကြမ်းအမြတ်)', String(totalProfit)],
        ['Total Expenses (အသုံးစားရိတ်များ)', String(totalExp)],
        ['Net Profit/Loss (အသားတင် အရှုံး/အမြတ်)', String(netProfit)],
      ];
    }

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `POS_Report_${reportSubTab}_${recordMode}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="reports-view-container" className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      {/* Top Filter Bar (Exact Match with Screenshot 1 & 2) */}
      {reportSubTab === 'sales_purchase' && (
        <div
          id="report-filter-bar"
          className="bg-[#f8f9fa] border-b border-gray-300 px-3 py-2 flex flex-wrap items-center gap-2 text-xs select-none shadow-xs"
        >
          {/* Record Selector (အရောင်းစာရင်း / အဝယ်စာရင်း) */}
          <div className="relative">
            <select
              id="select-record-mode"
              value={recordMode}
              onChange={(e) => setRecordMode(e.target.value as 'sales' | 'purchase')}
              className="bg-white border border-gray-300 rounded px-3 py-1 pr-7 font-bold text-gray-800 focus:outline-none focus:border-[#ff6600] cursor-pointer appearance-none shadow-xs"
            >
              <option value="sales">အရောင်းစာရင်း</option>
              <option value="purchase">အဝယ်စာရင်း</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2 top-2 pointer-events-none" />
          </div>

          {/* Store Selector */}
          <div className="relative">
            <select
              id="select-store"
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-1 pr-7 text-gray-800 focus:outline-none focus:border-[#ff6600] cursor-pointer appearance-none shadow-xs"
            >
              <option value="Main Store">Main Store</option>
              <option value="Branch 1">Branch 1 (Mandalay)</option>
              <option value="Branch 2">Branch 2 (Hledan)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2 top-2 pointer-events-none" />
          </div>

          {/* Category / Search Filter */}
          <div className="relative flex items-center">
            <select
              id="select-category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded px-2.5 py-1 pr-6 text-gray-700 focus:outline-none focus:border-[#ff6600] cursor-pointer appearance-none shadow-xs"
            >
              <option value="All">အမျိုးအစား (အားလုံး)</option>
              {availableCategories.filter((c) => c !== 'All').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-gray-500 absolute right-1.5 top-2 pointer-events-none" />
          </div>

          {/* Search Box */}
          <div className="relative min-w-[140px]">
            <input
              id="input-report-search"
              type="text"
              placeholder="ရှာဖွေရန်..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 pr-6 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#ff6600] shadow-xs"
            />
            <Search className="w-3 h-3 text-gray-400 absolute right-2 top-2" />
          </div>

          {/* Date Picker 1 */}
          <div className="flex items-center space-x-1 bg-white border border-gray-300 rounded px-2 py-0.5 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-gray-600" />
            <input
              type="text"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-20 text-xs font-mono text-gray-800 bg-transparent focus:outline-none"
            />
            <button className="text-gray-400 hover:text-gray-700">
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Date Picker 2 */}
          <div className="flex items-center space-x-1 bg-white border border-gray-300 rounded px-2 py-0.5 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-gray-600" />
            <input
              type="text"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-20 text-xs font-mono text-gray-800 bg-transparent focus:outline-none"
            />
            <button className="text-gray-400 hover:text-gray-700">
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Sale Type Selector (for Sales view) */}
          {recordMode === 'sales' && (
            <div className="relative">
              <select
                id="select-sale-type-filter"
                value={saleTypeFilter}
                onChange={(e) => setSaleTypeFilter(e.target.value)}
                className="bg-white border border-gray-300 rounded px-2.5 py-1 pr-6 text-gray-700 focus:outline-none focus:border-[#ff6600] cursor-pointer appearance-none shadow-xs"
              >
                <option value="Type 1">Type 1</option>
                <option value="All">အားလုံး</option>
                <option value="လက်လီ">လက်လီ</option>
                <option value="လက်ကား ၁">လက်ကား ၁</option>
                <option value="လက်ကား ၂">လက်ကား ၂</option>
              </select>
              <ChevronDown className="w-3 h-3 text-gray-500 absolute right-1.5 top-2 pointer-events-none" />
            </div>
          )}

          {/* Refresh / Enter Button */}
          <button
            id="btn-refresh-filter"
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('All');
              setSaleTypeFilter('Type 1');
            }}
            className="p-1 border border-gray-300 rounded bg-white hover:bg-gray-100 text-gray-700 shadow-xs cursor-pointer"
            title="မူလအတိုင်းပြန်လည်ရယူရန်"
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Table Content Area */}
      <div className="flex-1 overflow-auto bg-white pb-20 md:pb-0" id="printable-table-area">
        {reportSubTab === 'sales_purchase' && recordMode === 'sales' && (
          /* Table 1: Sales Record Table (Matching Screenshot 1) */
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse select-text min-w-[950px]">
              <thead>
                <tr className="bg-[#9da7b0] text-white font-bold tracking-tight select-none border-b border-gray-400">
                  <th className="py-2.5 px-3 w-12 text-center border-r border-gray-400/40">စဉ်</th>
                  <th className="py-2.5 px-3 w-24 border-r border-gray-400/40">ရက်စွဲ</th>
                  <th className="py-2.5 px-3 w-36 border-r border-gray-400/40">ဘောက်ချာ</th>
                  <th className="py-2.5 px-3 w-24 border-r border-gray-400/40">Barcode</th>
                  <th className="py-2.5 px-3 min-w-[140px] border-r border-gray-400/40">အမည်</th>
                  <th className="py-2.5 px-3 w-28 border-r border-gray-400/40">အမျိုးအစား</th>
                  <th className="py-2.5 px-3 w-20 text-right border-r border-gray-400/40">အရေအတွက်</th>
                  <th className="py-2.5 px-3 w-16 text-center border-r border-gray-400/40">Unit</th>
                  <th className="py-2.5 px-3 w-24 text-right border-r border-gray-400/40">ရောင်းဈေးနှုန်း</th>
                  <th className="py-2.5 px-3 w-16 text-center border-r border-gray-400/40">Discount</th>
                  <th className="py-2.5 px-3 w-24 text-right border-r border-gray-400/40">ကျသင့်ငွေ</th>
                  <th className="py-2.5 px-3 w-24 text-right border-r border-gray-400/40">အကြမ်းအမြတ်</th>
                  <th className="py-2.5 px-3 w-24 text-center">Sale Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((item, idx) => {
                  const isSelected = selectedRowId === item.id;
                  const isEven = idx % 2 === 1;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedRowId(item.id)}
                      className={`border-b border-gray-200 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#dbeafe] text-blue-950 font-medium'
                          : isEven
                          ? 'bg-[#efefef]'
                          : 'bg-white'
                      } hover:bg-[#e2e8f0]`}
                    >
                      <td className="py-2.5 px-3 text-center text-gray-700">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-800">{item.date}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-800">{item.voucherNo}</td>
                      <td className="py-2.5 px-3 font-mono font-medium text-gray-900">{item.barcode}</td>
                      <td className="py-2.5 px-3 font-medium text-gray-900">{item.itemName}</td>
                      <td className="py-2.5 px-3 text-gray-700">{item.category}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-800">{item.qty.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-center text-gray-700">{item.unit}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-800">{item.unitPrice.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-gray-700">{item.discount}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">{item.totalAmount.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-800">{item.grossProfit.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-center font-medium text-gray-800">{item.saleType}</td>
                    </tr>
                  );
                })}
                {/* Summary Row */}
                <tr className="bg-[#dcdfe3] font-bold text-gray-900 border-t-2 border-gray-400">
                  <td colSpan={6} className="py-2.5 px-3 text-right">
                    Total
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">{totalSalesQty.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-center">-</td>
                  <td className="py-2.5 px-3 text-right">-</td>
                  <td className="py-2.5 px-3 text-center font-mono">{totalSalesDiscount}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-black">{totalSalesAmount.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-black">{totalGrossProfit.toLocaleString()}</td>
                  <td className="py-2.5 px-3"></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {reportSubTab === 'sales_purchase' && recordMode === 'purchase' && (
          /* Table 2: Purchase Record Table (Matching Screenshot 2) */
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse select-text min-w-[950px]">
              <thead>
                <tr className="bg-[#9da7b0] text-white font-bold tracking-tight select-none border-b border-gray-400">
                  <th className="py-2.5 px-3 w-12 text-center border-r border-gray-400/40">စဉ်</th>
                  <th className="py-2.5 px-3 w-24 border-r border-gray-400/40">ရက်စွဲ</th>
                  <th className="py-2.5 px-3 w-36 border-r border-gray-400/40">ဘောက်ချာ</th>
                  <th className="py-2.5 px-3 w-24 border-r border-gray-400/40">Barcode</th>
                  <th className="py-2.5 px-3 min-w-[140px] border-r border-gray-400/40">အမည်</th>
                  <th className="py-2.5 px-3 w-28 border-r border-gray-400/40">အမျိုးအစား</th>
                  <th className="py-2.5 px-3 w-20 text-right border-r border-gray-400/40">အရေအတွက်</th>
                  <th className="py-2.5 px-3 w-16 text-center border-r border-gray-400/40">Unit</th>
                  <th className="py-2.5 px-3 w-24 text-right border-r border-gray-400/40">ဝယ်ဈေးနှုန်း</th>
                  <th className="py-2.5 px-3 w-28 text-right border-r border-gray-400/40">ကျသင့်ငွေ</th>
                  <th className="py-2.5 px-3 w-28 text-center border-r border-gray-400/40">ဆိုင်/ဆိုင်ခွဲ</th>
                  <th className="py-2.5 px-3 w-32 text-center">ကုန်သွင်းသူ</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map((item, idx) => {
                  const isSelected = selectedRowId === item.id;
                  const isEven = idx % 2 === 1;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedRowId(item.id)}
                      className={`border-b border-gray-200 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#dbeafe] text-blue-950 font-medium'
                          : isEven
                          ? 'bg-[#efefef]'
                          : 'bg-white'
                      } hover:bg-[#e2e8f0]`}
                    >
                      <td className="py-2.5 px-3 text-center text-gray-700">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-800">{item.date}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-800">{item.voucherNo}</td>
                      <td className="py-2.5 px-3 font-mono font-medium text-gray-900">{item.barcode}</td>
                      <td className="py-2.5 px-3 font-medium text-gray-900">{item.itemName}</td>
                      <td className="py-2.5 px-3 text-gray-700">{item.category}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-800">{item.qty.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-center text-gray-700">{item.unit}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-800">{item.buyPrice.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">{item.totalAmount.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-center text-gray-700">{item.store}</td>
                      <td className="py-2.5 px-3 text-center text-gray-800 font-medium">{item.supplier}</td>
                    </tr>
                  );
                })}
                {/* Summary Row */}
                <tr className="bg-[#dcdfe3] font-bold text-gray-900 border-t-2 border-gray-400">
                  <td colSpan={6} className="py-2.5 px-3 text-right">
                    Total
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">{totalPurchasesQty.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-center">-</td>
                  <td className="py-2.5 px-3 text-right">-</td>
                  <td className="py-2.5 px-3 text-right font-mono text-black">{totalPurchasesAmount.toLocaleString()}</td>
                  <td className="py-2.5 px-3" colSpan={2}></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {reportSubTab === 'receivable_payable' && (
          /* Subtab 2: Receivables & Payables Ledger */
          <div className="p-4 space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-2 h-4 bg-[#ff6600] rounded-xs inline-block"></span>
                ဖောက်သည်များထံမှ ရရန်ရှိငွေစာရင်း (Customer Receivables)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-gray-300 min-w-[650px]">
                  <thead className="bg-gray-200 font-bold text-gray-700">
                    <tr>
                      <th className="p-2 border">စဉ်</th>
                      <th className="p-2 border">ဝယ်ယူသူအမည်</th>
                      <th className="p-2 border">ဖုန်းနံပါတ်</th>
                      <th className="p-2 border">လိပ်စာ</th>
                      <th className="p-2 border text-right">ကြွေးကျန်ငွေ (Ks)</th>
                      <th className="p-2 border text-center">အမှတ် (Bonus)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c, i) => (
                      <tr key={c.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 border text-center">{i + 1}</td>
                        <td className="p-2 border font-medium text-gray-900">{c.name}</td>
                        <td className="p-2 border font-mono">{c.phone}</td>
                        <td className="p-2 border text-gray-600">{c.address}</td>
                        <td className="p-2 border text-right font-mono font-bold text-red-600">
                          {c.creditBalance.toLocaleString()} Ks
                        </td>
                        <td className="p-2 border text-center font-mono font-semibold text-orange-600">{c.bonusPoints}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-2 h-4 bg-gray-700 rounded-xs inline-block"></span>
                ကုန်သွင်းသူများသို့ ပေးရန်ရှိငွေစာရင်း (Supplier Payables)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-gray-300 min-w-[650px]">
                  <thead className="bg-gray-200 font-bold text-gray-700">
                    <tr>
                      <th className="p-2 border">စဉ်</th>
                      <th className="p-2 border">ကုန်သွင်းသူအမည်</th>
                      <th className="p-2 border">ဖုန်းနံပါတ်</th>
                      <th className="p-2 border">လိပ်စာ</th>
                      <th className="p-2 border text-right">ပေးရန်ကျန်ငွေ (Ks)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((s, i) => (
                      <tr key={s.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 border text-center">{i + 1}</td>
                        <td className="p-2 border font-medium text-gray-900">{s.name}</td>
                        <td className="p-2 border font-mono">{s.phone}</td>
                        <td className="p-2 border text-gray-600">{s.address}</td>
                        <td className="p-2 border text-right font-mono font-bold text-gray-900">
                          {s.debtBalance.toLocaleString()} Ks
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {reportSubTab === 'expenses' && (
          /* Subtab 3: Expense Summary */
          <div className="p-4">
            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-4 bg-red-500 rounded-xs inline-block"></span>
              ဆိုင်အသုံးစားရိတ် စာရင်းချုပ် (Expense Summary Ledger)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-gray-300 min-w-[650px]">
                <thead className="bg-gray-200 font-bold text-gray-700">
                  <tr>
                    <th className="p-2 border">စဉ်</th>
                    <th className="p-2 border">ရက်စွဲ</th>
                    <th className="p-2 border">ခေါင်းစဉ်</th>
                    <th className="p-2 border">အမျိုးအစား</th>
                    <th className="p-2 border text-right">ကျသင့်ငွေ</th>
                    <th className="p-2 border text-center">ငွေပေးချေမှုပုံစံ</th>
                    <th className="p-2 border">မှတ်ချက်</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp, i) => (
                    <tr key={exp.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 border text-center">{i + 1}</td>
                      <td className="p-2 border font-mono">{exp.date}</td>
                      <td className="p-2 border font-semibold text-gray-900">{exp.title}</td>
                      <td className="p-2 border text-gray-600">{exp.category}</td>
                      <td className="p-2 border text-right font-mono font-bold text-red-600">
                        {exp.amount.toLocaleString()} Ks
                      </td>
                      <td className="p-2 border text-center">{exp.paymentMethod}</td>
                      <td className="p-2 border text-gray-500">{exp.remark}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-bold">
                    <td colSpan={4} className="p-2 border text-right">စုစုပေါင်း အသုံးစားရိတ်</td>
                    <td className="p-2 border text-right font-mono text-red-600 text-sm">
                      {expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()} Ks
                    </td>
                    <td colSpan={2} className="p-2 border"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportSubTab === 'profit_loss' && (
          /* Subtab 4: Profit & Loss */
          <div className="p-6 max-w-4xl mx-auto space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center justify-between">
              <span>အရှုံး/အမြတ် စာရင်းချုပ် (Profit & Loss Statement)</span>
              <span className="text-xs font-normal text-gray-500 font-mono">Date: {fromDate} - {toDate}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded border border-gray-200 space-y-3">
                <div className="font-bold text-sm text-gray-800 border-b pb-1">ဝင်ငွေနှင့် အရောင်းအမြတ်</div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">စုစုပေါင်း အရောင်းရငွေ (Sales Turnover):</span>
                  <span className="font-mono font-bold">{totalSalesAmount.toLocaleString()} Ks</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">စုစုပေါင်း အကြမ်းအမြတ် (Gross Profit):</span>
                  <span className="font-mono font-bold text-emerald-600">{totalGrossProfit.toLocaleString()} Ks</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">အခြားဝင်ငွေပေါင်း (Other Income):</span>
                  <span className="font-mono font-bold text-blue-600">{incomes.reduce((sum, i) => sum + i.amount, 0).toLocaleString()} Ks</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded border border-gray-200 space-y-3">
                <div className="font-bold text-sm text-gray-800 border-b pb-1">ကုန်ကျစရိတ်နှင့် အသုံးစားရိတ်</div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">အဝယ်ပစ္စည်းတန်ဖိုး (Total Purchases):</span>
                  <span className="font-mono font-bold text-gray-800">{totalPurchasesAmount.toLocaleString()} Ks</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">ဆိုင်လည်ပတ်စရိတ်များ (Operating Expenses):</span>
                  <span className="font-mono font-bold text-red-600">{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()} Ks</span>
                </div>
              </div>
            </div>

            <div className="bg-[#f8fafc] border-2 border-gray-300 p-5 rounded flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Net Profit / Loss</div>
                <div className="text-lg font-bold text-gray-900">အသားတင် အရှုံး/အမြတ် ရလဒ်</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black font-mono text-gray-900">
                  {(totalGrossProfit - expenses.reduce((sum, e) => sum + e.amount, 0)).toLocaleString()} Ks
                </div>
                <div className="text-xs text-gray-500">Gross Profit - Operating Expenses</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action & Report Navigation Bar (Exact Match with Screenshot 2) */}
      <div
        id="report-bottom-toolbar"
        className="bg-[#2e353b] text-white px-3 md:px-4 py-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between select-none shrink-0 shadow-md border-t border-gray-700 gap-2 pb-14 md:pb-2 overflow-x-auto"
      >
        {/* Left Action Buttons */}
        <div className="flex items-center space-x-3 md:space-x-5 overflow-x-auto py-0.5 shrink-0">
          <button
            id="btn-export-excel"
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 text-xs text-gray-200 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-5 h-5 bg-[#107c41] text-white flex items-center justify-center font-bold text-[10px] rounded-xs shadow-xs">
              X
            </div>
            <span>Excel သို့ပြောင်းရန်</span>
          </button>

          <button
            id="btn-print-report"
            onClick={handlePrint}
            className="flex items-center space-x-1.5 text-xs text-gray-200 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-4 h-4 text-gray-300" />
            <span>Print ထုတ်ရန်</span>
          </button>

          <button
            id="btn-print-settings"
            onClick={() => setIsPrintSettingsOpen(true)}
            className="flex items-center space-x-1.5 text-xs text-gray-200 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <Sliders className="w-4 h-4 text-gray-300" />
            <span>Print Setting</span>
          </button>
        </div>

        {/* Right Sub-Tabs (Exact Match with Screenshot 2) */}
        <div className="flex items-center space-x-4 md:space-x-8 text-xs font-semibold overflow-x-auto py-0.5 shrink-0 scrollbar-none">
          <button
            id="tab-sales-purchase"
            onClick={() => setReportSubTab('sales_purchase')}
            className={`py-1 relative transition-colors cursor-pointer whitespace-nowrap ${
              reportSubTab === 'sales_purchase' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>အရောင်းအဝယ်</span>
            {reportSubTab === 'sales_purchase' && (
              <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#ff6600] rounded-full" />
            )}
          </button>

          <button
            id="tab-receivable-payable"
            onClick={() => setReportSubTab('receivable_payable')}
            className={`py-1 relative transition-colors cursor-pointer whitespace-nowrap ${
              reportSubTab === 'receivable_payable' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>ပေး/ရရန်ရှိ</span>
            {reportSubTab === 'receivable_payable' && (
              <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#ff6600] rounded-full" />
            )}
          </button>

          <button
            id="tab-expenses"
            onClick={() => setReportSubTab('expenses')}
            className={`py-1 relative transition-colors cursor-pointer whitespace-nowrap ${
              reportSubTab === 'expenses' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>အသုံးစားရိတ်</span>
            {reportSubTab === 'expenses' && (
              <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#ff6600] rounded-full" />
            )}
          </button>

          <button
            id="tab-profit-loss"
            onClick={() => setReportSubTab('profit_loss')}
            className={`py-1 relative transition-colors cursor-pointer whitespace-nowrap ${
              reportSubTab === 'profit_loss' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>အရှုံးအမြတ်</span>
            {reportSubTab === 'profit_loss' && (
              <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#ff6600] rounded-full" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
