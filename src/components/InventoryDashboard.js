import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../api';
import InventoryDetailsModal from './InventoryDetailsModal';
import AdjustInventoryModal from './AdjustInventoryModal';

function InventoryDashboard({ refreshTrigger }) {
  const [inventory, setInventory] = useState([]);
  const [locations, setLocations] = useState([]);
  const [valuation, setValuation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [adjustingMaterial, setAdjustingMaterial] = useState(null);

  useEffect(() => {
    fetchInventoryData();
  }, [refreshTrigger]);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const [inventoryRes, locationsRes, valuationRes] = await Promise.all([
        inventoryAPI.getSummary(),
        inventoryAPI.getByLocation(),
        inventoryAPI.getValuation(),
      ]);
      setInventory(inventoryRes.data);
      setLocations(locationsRes.data);
      setValuation(valuationRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch inventory data');
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (materialId) => {
    try {
      const response = await inventoryAPI.getDetails(materialId);
      setSelectedMaterial(response.data);
    } catch (err) {
      alert('Failed to load material details');
      console.error('Error loading details:', err);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      adequate: 'bg-emerald-100 text-emerald-700',
      low: 'bg-yellow-100 text-yellow-700',
      critical: 'bg-orange-100 text-orange-700',
      out_of_stock: 'bg-red-100 text-red-700',
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      adequate: '✓',
      low: '⚠️',
      critical: '⚠️',
      out_of_stock: '✗',
    };
    return icons[status] || '?';
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch =
      item.material_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.material_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' || item.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalItems: inventory.length,
    adequate: inventory.filter(i => i.status === 'adequate').length,
    low: inventory.filter(i => i.status === 'low').length,
    critical: inventory.filter(i => i.status === 'critical').length,
    outOfStock: inventory.filter(i => i.status === 'out_of_stock').length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-lg text-gray-500">Loading inventory...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-red-200 bg-red-50 p-6">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-red-900">Error Loading Inventory</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Total Items</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalItems}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Adequate Stock</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.adequate}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Low Stock</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.low}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Critical</p>
                <p className="text-3xl font-bold text-orange-600">{stats.critical}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🚨</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Out of Stock</p>
                <p className="text-3xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✗</span>
              </div>
            </div>
          </div>
        </div>

        {/* Valuation & Locations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Valuation */}
          {valuation && (
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Total Inventory Value
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-emerald-600">
                    ${valuation.total_inventory_value.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Current stock valuation</p>
                </div>
                <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">💰</span>
                </div>
              </div>
            </div>
          )}

          {/* Storage Locations */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Storage Locations
            </h3>
            <div className="space-y-3">
              {locations.map((location, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">📍</span>
                    <span className="font-medium text-gray-900">{location.location}</span>
                  </div>
                  <span className="text-sm text-gray-600">{location.item_count} items</span>
                </div>
              ))}
              {locations.length === 0 && (
                <p className="text-sm text-gray-500">No locations found</p>
              )}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by code, name, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  🔍
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field"
              >
                <option value="all">All Status</option>
                <option value="adequate">Adequate</option>
                <option value="low">Low Stock</option>
                <option value="critical">Critical</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>

              <span className="text-sm text-gray-500">
                {filteredInventory.length} of {inventory.length} items
              </span>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Min Level
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredInventory.map((item) => (
                  <tr key={item.material_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.material_name}</p>
                        <p className="text-xs text-gray-500">{item.material_code}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{item.category || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {item.total_quantity.toFixed(2)} <span className="text-gray-500">{item.unit_of_measure}</span>
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm text-gray-600">
                        {item.minimum_stock_level > 0 ? `${item.minimum_stock_level} ${item.unit_of_measure}` : 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-medium text-emerald-600">
                        ${item.total_value.toFixed(2)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`badge ${getStatusBadge(item.status)}`}>
                        {getStatusIcon(item.status)} {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(item.material_id)}
                          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          View
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => setAdjustingMaterial(item)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Adjust
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredInventory.length === 0 && (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📦</span>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No inventory found</h3>
                <p className="text-gray-500">
                  {searchTerm || filterStatus !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Receive purchase orders to add inventory'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedMaterial && (
        <InventoryDetailsModal
          materialData={selectedMaterial}
          onClose={() => setSelectedMaterial(null)}
          onRefresh={fetchInventoryData}
        />
      )}

      {adjustingMaterial && (
        <AdjustInventoryModal
          material={adjustingMaterial}
          onClose={() => setAdjustingMaterial(null)}
          onSuccess={() => {
            setAdjustingMaterial(null);
            fetchInventoryData();
          }}
        />
      )}
    </>
  );
}

export default InventoryDashboard;