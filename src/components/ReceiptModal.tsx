import React from 'react';
import { Printer, X, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CartItem, PaymentMethod } from '../types';

interface ReceiptModalProps {
  sale: {
    voucherNo: string;
    items: CartItem[];
    paymentMethod: PaymentMethod;
    totalAmount: number;
    cashTendered: number;
    changeAmount: number;
    customerName: string;
    date: string;
  };
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, onClose }) => {
  const { settings, activeStaff } = useApp();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-sm w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Controls */}
        <div className="bg-gray-800 text-white p-3 flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-xs">အရောင်းပြေစာ (Receipt)</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-[#ff6600] hover:bg-[#e65c00] text-white text-xs font-bold px-3 py-1 rounded flex items-center space-x-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Thermal Receipt Slip */}
        <div
          id="printable-receipt"
          className="p-5 font-mono text-[11px] text-gray-900 bg-white overflow-y-auto"
        >
          {/* Header */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-400">
            <h2 className="text-sm font-black tracking-wide font-sans">{settings.shopName}</h2>
            <p className="text-[10px] text-gray-600 font-sans">{settings.address}</p>
            <p className="text-[10px] text-gray-600">Tel: {settings.phone}</p>
            <div className="text-[9px] text-gray-500 whitespace-pre-line pt-1 font-sans">
              {settings.receiptHeader}
            </div>
          </div>

          {/* Meta */}
          <div className="py-2 space-y-0.5 border-b border-dashed border-gray-400 text-[10px]">
            <div className="flex justify-between">
              <span>Voucher:</span>
              <span className="font-bold">{sale.voucherNo}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{sale.date}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{activeStaff?.name || 'Admin'}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="font-sans">{sale.customerName}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-2 border-b border-dashed border-gray-400">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b border-gray-300 font-bold">
                  <th className="text-left pb-1">Item</th>
                  <th className="text-center pb-1">Qty</th>
                  <th className="text-right pb-1">Price</th>
                  <th className="text-right pb-1">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sale.items.map((item, i) => (
                  <tr key={i} className="py-1">
                    <td className="py-1 text-left font-sans">{item.product.name}</td>
                    <td className="py-1 text-center">{item.qty}</td>
                    <td className="py-1 text-right">{item.unitPrice.toLocaleString()}</td>
                    <td className="py-1 text-right font-bold">{item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="py-2 space-y-1 border-b border-dashed border-gray-400 text-[10px]">
            <div className="flex justify-between font-bold text-xs">
              <span>Total Amount:</span>
              <span>{sale.totalAmount.toLocaleString()} Ks</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Payment ({sale.paymentMethod}):</span>
              <span>{sale.cashTendered.toLocaleString()} Ks</span>
            </div>
            {sale.paymentMethod === 'Cash' && (
              <div className="flex justify-between text-gray-600 font-bold">
                <span>Change (ပြန်အမ်းငွေ):</span>
                <span>{sale.changeAmount.toLocaleString()} Ks</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-3 text-center font-sans">
            <p className="text-[10px] text-gray-600 whitespace-pre-line">{settings.receiptFooter}</p>
          </div>
        </div>

        {/* Bottom Close */}
        <div className="p-3 bg-gray-100 border-t border-gray-200 text-center no-print">
          <button
            onClick={onClose}
            className="w-full bg-gray-800 hover:bg-black text-white text-xs font-bold py-2 rounded cursor-pointer"
          >
            ဘောက်ချာပိတ်မည် (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
