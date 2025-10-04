import React, { useState, useEffect } from 'react';
import { salesAPI } from '../api';

function SalesOrdersList({ refreshTrigger }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [paymentReference, setPaymentReference] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [refreshTrigger]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await salesAPI.getAll();
      setOrders(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching sales orders:', err);
      setError('Failed to load sales orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await salesAPI.getDetails(orderId);
      setOrderDetails(response.data);
      setSelectedOrder(orders.find(o => o.id === orderId));
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error fetching order details:', err);
      alert('Failed to load order details');
    }
  };

  const handleFulfillOrder = async (orderId) => {
    if (!window.confirm('Fulfill this order? This will deduct inventory from finished goods.')) {
      return;
    }

    try {
      await salesAPI.fulfill(orderId);
      alert('Order fulfilled successfully! Inventory has been deducted.');
      await fetchOrders();
      if (showDetailsModal && selectedOrder?.id === orderId) {
        await fetchOrderDetails(orderId);
      }
    } catch (err) {
      console.error('Error fulfilling order:', err);

      if (err.response?.data?.detail?.insufficient_products) {
        const products = err.response.data.detail.insufficient_products;
        let message = 'Insufficient inventory to fulfill order:\n\n';
        products.forEach(p => {
          message += `${p.product_name} (${p.product_code}):\n`;
          message += `  Required: ${p.required}\n`;
          message += `  Available: ${p.available}\n`;
          message += `  Shortage: ${p.shortage}\n\n`;
        });
        alert(message);
      } else {
        alert(err.response?.data?.detail?.message || 'Failed to fulfill order');
      }
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    try {
      await salesAPI.recordPayment(
        selectedOrder.id,
        parseFloat(paymentAmount),
        paymentMethod,
        paymentReference || null
      );
      alert('Payment recorded successfully');
      setShowPaymentModal(false);
      setPaymentAmount('');
      setPaymentReference('');

      await fetchOrders();
      if (selectedOrder) {
        await fetchOrderDetails(selectedOrder.id);
      }
    } catch (err) {
      console.error('Error recording payment:', err);
      alert(err.response?.data?.detail || 'Failed to record payment');
    }
  };

  const handleDeleteOrder = async (orderId, orderNumber) => {
    if (!window.confirm(`Delete sales order ${orderNumber}? This can only be done for unfulfilled orders.`)) {
      return;
    }

    try {
      await salesAPI.delete(orderId);
      alert('Sales order deleted successfully');
      await fetchOrders();
    } catch (err) {
      console.error('Error deleting order:', err);
      alert(err.response?.data?.detail || 'Failed to delete sales order');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      fulfilled: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentBadge = (paymentStatus) => {
    const badges = {
      unpaid: 'bg-red-100 text-red-800',
      partial: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return badges[paymentStatus] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading sales orders...</p>
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
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="card-title">Sales Orders</h2>
            <span className="text-sm text-gray-500">{orders.length} total</span>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No sales orders found</p>
            <p className="text-sm text-gray-400">Create a sales order to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{order.order_number}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{order.customer_name}</div>
                      {order.customer_phone && (
                        <div className="text-xs text-gray-500">{order.customer_phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.order_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        KES {parseFloat(order.total_amount || 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Paid: KES {parseFloat(order.paid_amount || 0).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentBadge(order.payment_status)}`}>
                        {order.payment_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => fetchOrderDetails(order.id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </button>
                      {order.status !== 'fulfilled' && order.status !== 'cancelled' && (
                        <>
                          <button
                            onClick={() => handleFulfillOrder(order.id)}
                            className="text-emerald-600 hover:text-emerald-900 mr-3"
                          >
                            Fulfill
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id, order.order_number)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && orderDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Sales Order Details</h2>
                <p className="text-sm text-gray-500 mt-1">{orderDetails.order.order_number}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order & Customer Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                    Customer Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Name:</span> <span className="font-medium">{orderDetails.order.customer_name}</span></p>
                    {orderDetails.order.customer_email && (
                      <p><span className="text-gray-500">Email:</span> <span className="font-medium">{orderDetails.order.customer_email}</span></p>
                    )}
                    {orderDetails.order.customer_phone && (
                      <p><span className="text-gray-500">Phone:</span> <span className="font-medium">{orderDetails.order.customer_phone}</span></p>
                    )}
                    {orderDetails.order.shipping_address && (
                      <p><span className="text-gray-500">Address:</span> <span className="font-medium">{orderDetails.order.shipping_address}</span></p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                    Order Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Order Date:</span> <span className="font-medium">{orderDetails.order.order_date}</span></p>
                    {orderDetails.order.delivery_date && (
                      <p><span className="text-gray-500">Delivery Date:</span> <span className="font-medium">{orderDetails.order.delivery_date}</span></p>
                    )}
                    <p>
                      <span className="text-gray-500">Status:</span>{' '}
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(orderDetails.order.status)}`}>
                        {orderDetails.order.status.toUpperCase()}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Payment Status:</span>{' '}
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentBadge(orderDetails.order.payment_status)}`}>
                        {orderDetails.order.payment_status.toUpperCase()}
                      </span>
                    </p>
                    {orderDetails.order.payment_method && (
                      <p><span className="text-gray-500">Payment Method:</span> <span className="font-medium uppercase">{orderDetails.order.payment_method}</span></p>
                    )}
                    {orderDetails.order.payment_reference && (
                      <p><span className="text-gray-500">Payment Ref:</span> <span className="font-medium">{orderDetails.order.payment_reference}</span></p>
                    )}
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                  Order Items
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Inventory</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orderDetails.line_items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2">
                            <div className="font-medium">{item.product_name}</div>
                            <div className="text-xs text-gray-500">{item.product_code}</div>
                          </td>
                          <td className="px-4 py-2 text-right">{item.quantity}</td>
                          <td className="px-4 py-2 text-right">KES {item.unit_price.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right font-medium">KES {item.line_total.toFixed(2)}</td>
                          <td className="px-4 py-2 text-center text-xs">
                            Available: {item.available_inventory}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Amount:</span>
                      <span className="font-semibold">KES {orderDetails.order.total_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Paid Amount:</span>
                      <span className="font-semibold text-green-600">KES {orderDetails.order.paid_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-700 font-medium">Outstanding:</span>
                      <span className="font-bold text-red-600">
                        KES {(orderDetails.order.total_amount - orderDetails.order.paid_amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 border-t pt-4">
                {orderDetails.order.payment_status !== 'paid' && orderDetails.order.status !== 'cancelled' && (
                  <button
                    onClick={() => {
                      setPaymentAmount((orderDetails.order.total_amount - orderDetails.order.paid_amount).toFixed(2));
                      setShowPaymentModal(true);
                    }}
                    className="btn-primary"
                  >
                    Record Payment
                  </button>
                )}
              </div>

              {orderDetails.order.notes && (
                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm text-gray-700">{orderDetails.order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Record Payment</h3>
              <p className="text-sm text-gray-500">Order: {selectedOrder.order_number}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (KES)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="input-field"
                  min="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="input-field"
                >
                  <option value="mpesa">M-PESA</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit">Credit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Reference (Optional)
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="input-field"
                  placeholder="e.g., M-PESA code, cheque number..."
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentAmount('');
                  setPaymentReference('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPayment}
                className="btn-primary"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SalesOrdersList;
