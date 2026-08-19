export type NavTab =
  | 'shop'
  | 'sales'
  | 'purchase'
  | 'edit'
  | 'income_expense'
  | 'reports'
  | 'setting'
  | 'close_shop'
  | 'bonus';

export type ReportSubTab =
  | 'sales_purchase'
  | 'receivable_payable'
  | 'expenses'
  | 'profit_loss';

export type SaleType =
  | 'လက်လီ'
  | 'လက်ကား (၅ ထည်)'
  | 'လက်ကား (၁၀ ထည်)'
  | 'လက်ကား (၂၀ ထည်)'
  | 'လက်ကား ၁'
  | 'လက်ကား ၂';

export type PaymentMethod = 'Cash' | 'Bank' | 'Credit';

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  unit: string;
  buyPrice: number;
  retailPrice: number;
  wholesalePrice1: number; // လက်ကား ၅ ထည်
  wholesalePrice2: number; // လက်ကား ၁၀ ထည်
  wholesalePrice3?: number; // လက်ကား ၂၀ ထည်
  stockQty: number;
  minStockLevel?: number;
  store: string;
  supplier: string;
  imageUrl?: string;
}

export interface SaleRecord {
  id: string;
  date: string;
  voucherNo: string;
  barcode: string;
  itemName: string;
  category: string;
  qty: number;
  unit: string;
  unitPrice: number;
  discount: number;
  totalAmount: number;
  grossProfit: number;
  saleType: SaleType;
  store: string;
  cashier: string;
  paymentMethod: PaymentMethod;
  customerId?: string;
  customerName?: string;
  createdAt?: string;
}

export interface PurchaseRecord {
  id: string;
  date: string;
  voucherNo: string;
  barcode: string;
  itemName: string;
  category: string;
  qty: number;
  unit: string;
  buyPrice: number;
  totalAmount: number;
  store: string;
  supplier: string;
  paymentMethod: PaymentMethod;
  createdAt?: string;
}

export interface IncomeRecord {
  id: string;
  date: string;
  voucherNo?: string;
  title: string;
  category: string;
  amount: number;
  paymentMethod: 'Cash' | 'Bank';
  cashier: string;
  remark: string;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  voucherNo?: string;
  title: string;
  category: string;
  amount: number;
  paymentMethod: 'Cash' | 'Bank';
  cashier: string;
  remark: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  creditBalance: number;
  bonusPoints: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  debtBalance: number;
}

export interface StaffUser {
  id: string;
  name: string;
  role: string;
  pin: string;
  counter: string;
  active: boolean;
}

export interface StoreSettings {
  shopName: string;
  phone: string;
  address: string;
  taxNumber?: string;
  receiptHeader: string;
  receiptFooter: string;
  defaultStore: string;
  printerType: '80mm' | '58mm' | 'A4';
  autoPrint: boolean;
  enableBonus: boolean;
  bonusRate: number; // e.g. 1 point per 1000 Ks
}

export interface CartItem {
  product: Product;
  qty: number;
  selectedPriceType: SaleType;
  unitPrice: number;
  discount: number;
  total: number;
}
