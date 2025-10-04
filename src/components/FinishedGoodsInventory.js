import React, { useState, useEffect } from 'react';
import { finishedGoodsAPI } from '../api';

function FinishedGoodsInventory({ refreshTrigger }) {
  const [summary, setSummary] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [adjustQuantity, setAdjustQuantity] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, statsRes] = await Promise.all([
        finishedGoodsAPI.getSummary(),
        finishedGoodsAPI.getStatistics()
      ]);
      setSummary(summaryRes.data);
      setStatistics(statsRes.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching finished goods:', err);
      setError('Failed to load finished goods inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductDetails = async (productCode) => {
    try {
      const response = await finishedGoodsAPI.getByProductCode(productCode);
      setProductDetails(response.data);
      setSelectedProduct(productCode);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error fetching product details:', err);
      alert('Failed to load product details');
    }
  };

  const handleAdjustQuantity = async () => {
    if (!adjustQuantity || parseFloat(adjustQuantity) < 0) {
      alert('Please enter a valid quantity');
      return;
    }

    try {
      await finishedGoodsAPI.adjustQuantity(
        selectedBatch.id,
        parseFloat(adjustQuantity),
        adjustReason || 'Manual adjustment'
      );
      alert('Quantity adjusted successfully');
      setShowAdjustModal(false);
      setAdjustQuantity('');
      setAdjustReason('');
      setSelectedBatch(null);

      // Refresh details
      if (selectedProduct) {
        await fetchProductDetails(selectedProduct);
      }
      await fetchData();
    } catch (err) {
      console.error('Error adjusting quantity:', err);
      alert(err.response?.data?.detail || 'Failed to adjust quantity');
    }
  };

  const handleUpdateStatus = async (batchId, newStatus) => {
    try {
      await finishedGoodsAPI.updateStatus(batchId, newStatus);
      alert('Status updated successfully');

      // Refresh details
      if (selectedProduct) {
        await fetchProductDetails(selectedProduct);
      }
      await fetchData();
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.detail || 'Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: 'bg-green-100 text-green-800',
      reserved: 'bg-blue-100 text-blue-800',
      shipped: 'bg-gray-100 text-gray-800',
      damaged: 'bg-red-100 text-red-800',
      expired: 'bg-yellow-100 text-yellow-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading finished goods inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-red-200 bg-red-50 p-6">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <div className="p-6">
                <p className="text-sm text-emerald-600 font-medium mb-2">Total Items</p>
                <p className="text-3xl font-bold text-emerald-900">{statistics.total_items}</p>
              </div>
            </div>
            <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="p-6">
                <p className="text-sm text-blue-600 font-medium mb-2">Available Quantity</p>
                <p className="text-3xl font-bold text-blue-900">{statistics.total_available_quantity.toFixed(2)}</p>
              </div>
            </div>
            <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="p-6">
                <p className="text-sm text-purple-600 font-medium mb-2">Unique Products</p>
                <p className="text-3xl font-bold text-purple-900">{statistics.unique_products}</p>
              </div>
            </div>
            <div className="card bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <div className="p-6">
                <p className="text-sm text-amber-600 font-medium mb-2">Status Types</p>
                <p className="text-3xl font-bold text-amber-900">{statistics.status_breakdown.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Summary */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Finished Goods Inventory by Product</h2>
          </div>

          {summary.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No finished goods in inventory</p>
              <p className="text-sm text-gray-400">Complete production batches to add finished goods</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batches
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Latest Production
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {summary.map((product) => (
                    <tr key={product.product_code} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{product.product_code}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{product.product_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-lg font-semibold text-emerald-600">
                          {product.total_quantity.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.unit_of_measure}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {product.batch_count}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.latest_production_date || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => fetchProductDetails(product.product_code)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Batches
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Product Details Modal */}
      {showDetailsModal && productDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{productDetails.product_name}</h2>
                <p className="text-sm text-gray-500 mt-1">{productDetails.product_code}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Available</p>
                    <p className="text-3xl font-bold text-emerald-600">
                      {productDetails.total_quantity.toFixed(2)} {productDetails.unit_of_measure}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Batches</p>
                    <p className="text-2xl font-bold text-gray-900">{productDetails.batches.length}</p>
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Batch Details
              </h3>

              <div className="space-y-3">
                {productDetails.batches.map((batch) => (
                  <div key={batch.id} className="card p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <p className="font-medium text-gray-900">{batch.batch_number}</p>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(batch.status)}`}>
                            {batch.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500">Quantity</p>
                            <p className="font-medium">{batch.quantity} {productDetails.unit_of_measure}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Production Date</p>
                            <p className="font-medium">{batch.production_date || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Storage Location</p>
                            <p className="font-medium">{batch.storage_location || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Expiry Date</p>
                            <p className="font-medium">{batch.expiry_date || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setSelectedBatch(batch);
                          setAdjustQuantity(batch.quantity.toString());
                          setShowAdjustModal(true);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-900"
                      >
                        Adjust Quantity
                      </button>
                      <span className="text-gray-300">|</span>
                      <select
                        value={batch.status}
                        onChange={(e) => handleUpdateStatus(batch.id, e.target.value)}
                        className="text-sm border-gray-300 rounded-md"
                      >
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="shipped">Shipped</option>
                        <option value="damaged">Damaged</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Quantity Modal */}
      {showAdjustModal && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Adjust Quantity</h3>
              <p className="text-sm text-gray-500">Batch: {selectedBatch.batch_number}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Quantity
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(e.target.value)}
                  className="input-field"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Current: {selectedBatch.quantity}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (optional)
                </label>
                <textarea
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  rows="3"
                  className="input-field"
                  placeholder="e.g., Damaged goods, Quality control adjustment..."
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAdjustModal(false);
                  setAdjustQuantity('');
                  setAdjustReason('');
                  setSelectedBatch(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustQuantity}
                className="btn-primary"
              >
                Adjust Quantity
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FinishedGoodsInventory;
