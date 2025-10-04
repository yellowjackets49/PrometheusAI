import React from 'react';
import { goodsReceiptAPI, purchaseOrdersAPI } from '../api';

function ViewPOModal({ poData, onClose, onRefresh }) {
  const { po, supplier, line_items } = poData;

  const handleReceivePO = async () => {
    if (window.confirm('Mark this purchase order as received and update inventory?')) {
      try {
        await goodsReceiptAPI.receivePO(po.id);
        alert('Purchase order received! Inventory has been updated.');
        onRefresh();
        onClose();
      } catch (err) {
        console.error('Error receiving PO:', err);
        alert(err.response?.data?.detail || 'Failed to receive purchase order');
      }
    }
  };

  const handleCancelPO = async () => {
    if (window.confirm('Are you sure you want to cancel this purchase order?')) {
      try {
        await purchaseOrdersAPI.updateStatus(po.id, 'cancelled');
        onRefresh();
        onClose();
      } catch (err) {
        console.error('Error cancelling PO:', err);
        alert('Failed to cancel purchase order');
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-semibold text-gray-900">Purchase Order Details</h2>
              <span className={`badge ${getStatusBadge(po.status)}`}>
                {po.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{po.po_number}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* PO Info and Supplier Info Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PO Information */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Order Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">PO Number:</span>
                  <span className="font-medium text-gray-900">{po.po_number}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(po.order_date).toLocaleDateString()}
                  </span>
                </div>
                {po.expected_delivery_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Expected Delivery:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(po.expected_delivery_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-3 border-t border-gray-200">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-semibold text-emerald-600 text-lg">
                    ${parseFloat(po.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Supplier Information */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Supplier Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Supplier Code</p>
                  <p className="font-medium text-gray-900">{supplier.supplier_code}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Company Name</p>
                  <p className="font-medium text-gray-900">{supplier.name}</p>
                </div>
                {supplier.contact_person && (
                  <div>
                    <p className="text-xs text-gray-500">Contact Person</p>
                    <p className="font-medium text-gray-900">{supplier.contact_person}</p>
                  </div>
                )}
                {supplier.email && (
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <a
                      href={`mailto:${supplier.email}`}
                      className="font-medium text-emerald-600 hover:underline"
                    >
                      {supplier.email}
                    </a>
                  </div>
                )}
                {supplier.phone && (
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <a
                      href={`tel:${supplier.phone}`}
                      className="font-medium text-gray-900"
                    >
                      {supplier.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {po.notes && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Notes
              </h3>
              <p className="text-sm text-gray-700">{po.notes}</p>
            </div>
          )}

          {/* Line Items */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Order Items ({line_items.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Material
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Qty Ordered
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Qty Received
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Unit Price
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {line_items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.material_name}</p>
                          <p className="text-xs text-gray-500">{item.material_code}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <p className="text-sm text-gray-900">
                          {item.quantity_ordered} <span className="text-gray-500">{item.unit_of_measure}</span>
                        </p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <p className={`text-sm font-medium ${item.quantity_received > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {item.quantity_received} <span className="text-gray-500">{item.unit_of_measure}</span>
                        </p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <p className="text-sm text-gray-900">${item.unit_price.toFixed(2)}</p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <p className="text-sm font-medium text-gray-900">${item.line_total.toFixed(2)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="4" className="px-5 py-4 text-right text-sm font-semibold text-gray-900">
                      Total Amount:
                    </td>
                    <td className="px-5 py-4 text-right text-lg font-bold text-emerald-600">
                      ${parseFloat(po.total_amount).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              {po.status === 'pending' && (
                <>
                  <button
                    onClick={handleReceivePO}
                    className="btn-primary text-sm flex items-center space-x-2"
                  >
                    <span>📦</span>
                    <span>Receive & Update Inventory</span>
                  </button>
                  <button
                    onClick={handleCancelPO}
                    className="btn-secondary text-sm"
                  >
                    Cancel Order
                  </button>
                </>
              )}
              {po.status === 'received' && (
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-600 text-xl">✓</span>
                  <span className="text-sm text-emerald-600 font-medium">Order Received - Inventory Updated</span>
                </div>
              )}
              {po.status === 'cancelled' && (
                <span className="text-sm text-red-600 font-medium">✗ Order Cancelled</span>
              )}
            </div>
            <button
              onClick={onClose}
              className="btn-secondary text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewPOModal;