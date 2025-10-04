import React, { useState, useEffect } from 'react';
import { rawMaterialsAPI } from '../api';

function Dashboard({ refreshTrigger }) {
  const [stats, setStats] = useState({
    totalMaterials: 0,
    lowStock: 0,
    outOfStock: 0,
  });
  const [inventoryStatus, setInventoryStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [materialsRes, inventoryRes] = await Promise.all([
        rawMaterialsAPI.getAll(),
        rawMaterialsAPI.getInventoryStatus(),
      ]);

      const materials = materialsRes.data;
      const inventory = inventoryRes.data;

      setStats({
        totalMaterials: materials.length,
        lowStock: inventory.filter(item => item.status === 'low_stock').length,
        outOfStock: inventory.filter(item => item.status === 'out_of_stock').length,
      });

      setInventoryStatus(inventory);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      adequate: 'bg-emerald-100 text-emerald-700',
      warning: 'bg-yellow-100 text-yellow-700',
      low_stock: 'bg-orange-100 text-orange-700',
      out_of_stock: 'bg-red-100 text-red-700',
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-lg text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Total Materials</p>
              <p className="text-4xl font-bold text-gray-900">{stats.totalMaterials}</p>
              <p className="text-sm text-emerald-600 mt-2">All materials in system</p>
            </div>
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Low Stock Items</p>
              <p className="text-4xl font-bold text-gray-900">{stats.lowStock}</p>
              <p className="text-sm text-orange-600 mt-2">Needs attention</p>
            </div>
            <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Out of Stock</p>
              <p className="text-4xl font-bold text-gray-900">{stats.outOfStock}</p>
              <p className="text-sm text-red-600 mt-2">Requires action</p>
            </div>
            <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🚨</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Status Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Inventory Status</h3>
              <p className="text-sm text-gray-500 mt-1">Current stock levels for all materials</p>
            </div>
            <button className="btn-secondary text-sm">
              Export Report
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Material
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Min Level
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {inventoryStatus.map((item) => (
                <tr key={item.material_code} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.material_name}</p>
                      <p className="text-xs text-gray-500">{item.material_code}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">
                      {item.total_quantity} <span className="text-gray-500">{item.unit_of_measure}</span>
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">
                      {item.minimum_stock_level || 'N/A'} <span className="text-gray-500">{item.unit_of_measure}</span>
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${getStatusBadge(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;