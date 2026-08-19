import {
  Product,
  SaleRecord,
  PurchaseRecord,
  IncomeRecord,
  ExpenseRecord,
  Customer,
  Supplier,
  StaffUser,
  StoreSettings,
} from '../types';

// Clean initial data ready for real shop products and inventory
export const initialProducts: Product[] = [];

// Clean initial sales records
export const initialSales: SaleRecord[] = [];

// Clean initial purchase records
export const initialPurchases: PurchaseRecord[] = [];

// Clean initial incomes
export const initialIncomes: IncomeRecord[] = [];

// Clean initial expenses
export const initialExpenses: ExpenseRecord[] = [];

// Clean initial customer directory
export const initialCustomers: Customer[] = [];

// Clean initial supplier directory
export const initialSuppliers: Supplier[] = [];

// Staff accounts
export const initialStaff: StaffUser[] = [
  {
    id: 'staff-1',
    name: 'Admin',
    role: 'Shop Owner / Manager',
    pin: '9569',
    counter: 'ကောင်တာ ၁',
    active: true,
  },
  {
    id: 'staff-2',
    name: 'Suyee',
    role: 'Shop Owner / Manager',
    pin: '5135',
    counter: 'ကောင်တာ ၁',
    active: false,
  },
];

// Shop settings
export const initialSettings: StoreSettings = {
  shopName: 'Kaprin Fashion',
  phone: '09-797485135',
  address: 'အမှတ်(၂)ရပ်ကွက်၊ဆရာစံလမ်း၊အောင်ပန်းမြို့။(ဓူဝံလက်ဖက်ရည်ဆိုင်အနီး)',
  receiptHeader: 'Kaprin Fashion မှ လူကြီးမင်းတို့၏ စိတ်တိုင်းကျ ရွေးချယ်ဝယ်ယူမှုအတွက် ကျေးဇူးတင်ပါသည်',
  receiptFooter: 'ဝယ်ယူပြီးပစ္စည်း ပြန်မလဲပါ\nကျေးဇူးတင်ပါသည် နောက်လည်းကြွပါခင်ဗျာ။',
  defaultStore: 'Main Store',
  printerType: '80mm',
  autoPrint: false,
  enableBonus: true,
  bonusRate: 1000,
};
