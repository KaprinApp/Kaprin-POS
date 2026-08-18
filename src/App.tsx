/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BottomBanner } from './components/BottomBanner';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileDrawer } from './components/MobileDrawer';
import { ReportsView } from './views/ReportsView';
import { CloseShopView } from './views/CloseShopView';
import { SalesPOSView } from './views/SalesPOSView';
import { PurchaseEntryView } from './views/PurchaseEntryView';
import { InventoryManageView } from './views/InventoryManageView';
import { IncomeExpenseView } from './views/IncomeExpenseView';
import { BonusView } from './views/BonusView';
import { SettingsView } from './views/SettingsView';
import { ShopDashboardView } from './views/ShopDashboardView';
import { StaffSelectModal } from './components/StaffSelectModal';
import { HelpModal } from './components/HelpModal';
import { PrintSettingsModal } from './components/PrintSettingsModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';

const AppContent: React.FC = () => {
  const { currentTab } = useApp();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const renderActiveView = () => {
    switch (currentTab) {
      case 'reports':
        return <ReportsView />;
      case 'close_shop':
        return <CloseShopView />;
      case 'sales':
        return <SalesPOSView />;
      case 'purchase':
        return <PurchaseEntryView />;
      case 'edit':
        return <InventoryManageView />;
      case 'income_expense':
        return <IncomeExpenseView />;
      case 'bonus':
        return <BonusView />;
      case 'setting':
        return <SettingsView />;
      case 'shop':
      default:
        return <ShopDashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#e9ecef] overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header onOpenMobileMenu={() => setMobileDrawerOpen(true)} />

        {/* Dynamic Main Body View */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {renderActiveView()}
        </main>

        {/* Bottom Support Banner on Desktop */}
        <BottomBanner />

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav onOpenMenu={() => setMobileDrawerOpen(true)} />
      </div>

      {/* Mobile Sliding Drawer */}
      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />

      {/* Global Modals */}
      <StaffSelectModal />
      <HelpModal />
      <PrintSettingsModal />
      <SupabaseConfigModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
