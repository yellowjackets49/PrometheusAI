import React, { useState } from 'react';
import MaterialsList from './components/MaterialsList';
import AddMaterialForm from './components/AddMaterialForm';
import Dashboard from './components/Dashboard';
import SuppliersList from './components/SuppliersList';
import AddSupplierForm from './components/AddSupplierForm';
import PurchaseOrdersList from './components/PurchaseOrdersList';
import CreatePurchaseOrderForm from './components/CreatePurchaseOrderForm';
import InventoryDashboard from './components/InventoryDashboard';
import BOMList from './components/BOMList';
import CreateBOMForm from './components/CreateBOMForm';
import ProductionBatchList from './components/ProductionBatchList';
import CreateProductionBatchForm from './components/CreateProductionBatchForm';
import FinishedGoodsInventory from './components/FinishedGoodsInventory';
import SalesOrdersList from './components/SalesOrdersList';
import CreateSalesOrderForm from './components/CreateSalesOrderForm';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleMaterialAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setCurrentView('materials');
  };

  const handleSupplierAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setCurrentView('suppliers');
  };

  const handlePOAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setCurrentView('purchase-orders');
  };

  const handleBOMAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setCurrentView('bom');
  };

  const handleProductionBatchAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setCurrentView('production');
  };

  const handleSalesOrderAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setCurrentView('sales');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'materials', label: 'Raw Materials', icon: '📦' },
    { id: 'suppliers', label: 'Suppliers', icon: '🏢' },
    { id: 'purchase-orders', label: 'Purchase Orders', icon: '🛒' },
    { id: 'inventory', label: 'Raw Material Inventory', icon: '📋' },
    { id: 'bom', label: 'Bill of Materials', icon: '📝' },
    { id: 'production', label: 'Production', icon: '⚙️' },
    { id: 'finished-goods', label: 'Finished Goods', icon: '📦' },
    { id: 'sales', label: 'Sales', icon: '💰' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">Management System</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => !item.disabled && setCurrentView(item.id)}
              disabled={item.disabled}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                currentView === item.id
                  ? 'bg-emerald-50 text-emerald-700'
                  : item.disabled
                  ? 'text-gray-400 cursor-not-allowed opacity-50'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
              {item.disabled && (
                <span className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded">Soon</span>
              )}
            </button>
          ))}
        </nav>

        {/* Add Buttons */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          {currentView === 'materials' && (
            <button
              onClick={() => setCurrentView('add-material')}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <span className="text-xl">+</span>
              <span>Add Material</span>
            </button>
          )}
          {currentView === 'suppliers' && (
            <button
              onClick={() => setCurrentView('add-supplier')}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <span className="text-xl">+</span>
              <span>Add Supplier</span>
            </button>
          )}
          {currentView === 'purchase-orders' && (
            <button
              onClick={() => setCurrentView('create-po')}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <span className="text-xl">+</span>
              <span>Create PO</span>
            </button>
          )}
          {currentView === 'bom' && (
            <button
              onClick={() => setCurrentView('create-bom')}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <span className="text-xl">+</span>
              <span>Create BOM</span>
            </button>
          )}
          {currentView === 'production' && (
            <button
              onClick={() => setCurrentView('create-production-batch')}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <span className="text-xl">+</span>
              <span>Create Batch</span>
            </button>
          )}
          {currentView === 'sales' && (
            <button
              onClick={() => setCurrentView('create-sales-order')}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <span className="text-xl">+</span>
              <span>Create Order</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ml-64 min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {navItems.find(item => item.id === currentView)?.label ||
                 (currentView === 'add-material' ? 'Add Material' :
                  currentView === 'add-supplier' ? 'Add Supplier' :
                  currentView === 'create-po' ? 'Create Purchase Order' :
                  currentView === 'create-bom' ? 'Create Bill of Materials' :
                  currentView === 'create-production-batch' ? 'Create Production Batch' :
                  currentView === 'create-sales-order' ? 'Create Sales Order' : '')}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {currentView === 'dashboard' && 'Overview of your inventory system'}
                {currentView === 'materials' && 'Manage your raw materials'}
                {currentView === 'suppliers' && 'Manage your suppliers'}
                {currentView === 'purchase-orders' && 'Manage purchase orders'}
                {currentView === 'inventory' && 'Track and manage raw material stock levels'}
                {currentView === 'bom' && 'Define materials required for your products'}
                {currentView === 'production' && 'Manage production batches and manufacturing'}
                {currentView === 'finished-goods' && 'View and manage finished goods inventory'}
                {currentView === 'sales' && 'Manage sales orders and customer transactions'}
                {currentView === 'add-material' && 'Add a new raw material'}
                {currentView === 'add-supplier' && 'Add a new supplier'}
                {currentView === 'create-po' && 'Create a new purchase order'}
                {currentView === 'create-bom' && 'Create a new bill of materials'}
                {currentView === 'create-production-batch' && 'Plan a new production run'}
                {currentView === 'create-sales-order' && 'Create a new sales order'}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Welcome back</p>
                <p className="text-sm font-medium text-gray-900">Admin User</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-emerald-700 font-semibold">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {currentView === 'dashboard' && <Dashboard refreshTrigger={refreshTrigger} />}
          {currentView === 'materials' && <MaterialsList refreshTrigger={refreshTrigger} />}
          {currentView === 'add-material' && <AddMaterialForm onSuccess={handleMaterialAdded} />}
          {currentView === 'suppliers' && <SuppliersList refreshTrigger={refreshTrigger} />}
          {currentView === 'add-supplier' && <AddSupplierForm onSuccess={handleSupplierAdded} />}
          {currentView === 'purchase-orders' && <PurchaseOrdersList refreshTrigger={refreshTrigger} />}
          {currentView === 'create-po' && <CreatePurchaseOrderForm onSuccess={handlePOAdded} />}
          {currentView === 'inventory' && <InventoryDashboard refreshTrigger={refreshTrigger} />}
          {currentView === 'bom' && <BOMList refreshTrigger={refreshTrigger} />}
          {currentView === 'create-bom' && <CreateBOMForm onSuccess={handleBOMAdded} />}
          {currentView === 'production' && <ProductionBatchList refreshTrigger={refreshTrigger} />}
          {currentView === 'create-production-batch' && <CreateProductionBatchForm onSuccess={handleProductionBatchAdded} />}
          {currentView === 'finished-goods' && <FinishedGoodsInventory refreshTrigger={refreshTrigger} />}
          {currentView === 'sales' && <SalesOrdersList refreshTrigger={refreshTrigger} />}
          {currentView === 'create-sales-order' && <CreateSalesOrderForm onSuccess={handleSalesOrderAdded} />}
        </main>
      </div>
    </div>
  );
}

export default App;