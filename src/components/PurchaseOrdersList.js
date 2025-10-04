import React, { useState, useEffect } from 'react';
import { purchaseOrdersAPI, goodsReceiptAPI } from '../api';
import ViewPOModal from './ViewPOModal';

function PurchaseOrdersList({ refreshTrigger }) {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingPO, setViewingPO] = useState(null);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [refreshTrigger]);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const response = await purchaseOrdersAPI.getAll();
      setPurchaseOrders(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch purchase orders');
      console.error('Error fetching purchase orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, poNumber) => {
    if (window.confirm(`Are you sure you want to delete PO ${poNumber}?`)) {
      try {
        await purchaseOrdersAPI.delete(id);
        fetchPurchaseOrders();
      } catch (err) {
        alert('Failed to delete purchase order');
        console.error('Error deleting purchase order:', err);
      }
    }
  };

  const handleViewDetails = async (po) => {
    try {
      const response = await purchaseOrdersAPI.getDetails(po.id);
      setViewingPO(response.data);
    } catch (err) {
      alert('Failed to load PO details');
      console.error('Error loading PO details:', err);
    }
  };

  const handleReceivePO = async (id, poNumber) => {
    if (window.confirm(`Mark PO ${poNumber} as received and update inventory?`)) {
      try {
        await goodsReceiptAPI.receivePO(id);
        alert('Purchase order received! Inventory has been updated.');
        fetchPurchaseOrders();
      } catch (err) {
        console.error('Error receiving PO:', err);
        alert(err.response?.data?.detail || 'Failed to receive purchase order');
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700',
      partial: 'bg-blue-100 text-blue-700',
      received: 'bg-emerald-100 text-emerald-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const filteredPOs = purchaseOrders.filter(po =>
    po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-lg text-gray-500">Loading purchase orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-red-200 bg-red-50 p-6">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-red-900">Error Loading Purchase Orders</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Search and Actions Bar */}
        <div className="card p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by PO number or status..."
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
              <span className="text-sm text-gray-500">
                {filteredPOs.length} of {purchaseOrders.length} purchase orders
              </span>
              <button className="btn-secondary text-sm">
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Purchase Orders Grid */}
        {filteredPOs.length === 0 ? (
          <div className="card p-12 text-center">
            <span className="text-6xl mb-4 block">🛒</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No purchase orders found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search' : 'Create your first purchase order to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPOs.map((po) => (
              <div key={po.id} className="card p-6 hover:shadow-lg transition-all duration-200">
                {/* PO Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        {po.po_number}
                      </span>
                      <span className={`badge ${getStatusBadge(po.status)}`}>
                        {po.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PO Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Order Date</span>
                    <span className="font-medium text-gray-900">
                      {new Date(po.order_date).toLocaleDateString()}
                    </span>
                  </div>

                  {po.expected_delivery_date && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Expected Delivery</span>
                      <span className="font-medium text-gray-900">
                        {new Date(po.expected_delivery_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Total Amount</span>
                    <span className="font-semibold text-emerald-600 text-lg">
                      ${parseFloat(po.total_amount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => handleViewDetails(po)}
                    className="text-sm text-gray-600 hover:text-emerald-600 font-medium transition-colors"
                  >
                    View Details
                  </button>

                  {po.status === 'pending' && (
                    <button
                      onClick={() => handleReceivePO(po.id, po.po_number)}
                      className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors font-medium"
                    >
                      Mark Received
                    </button>
                  )}

                  {po.status === 'received' && (
                    <span className="text-xs text-emerald-600 font-medium">✓ Received</span>
                  )}

                  {po.status !== 'received' && (
                    <button
                      onClick={() => handleDelete(po.id, po.po_number)}
                      className="text-sm text-gray-600 hover:text-red-600 font-medium transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View PO Modal */}
      {viewingPO && (
        <ViewPOModal
          poData={viewingPO}
          onClose={() => setViewingPO(null)}
          onRefresh={fetchPurchaseOrders}
        />
      )}
    </>
  );
}

export default PurchaseOrdersList;