import React, { useState, useEffect } from 'react';
import { salesAPI, finishedGoodsAPI } from '../api';

function CreateSalesOrderForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    order_number: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    order_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    shipping_address: '',
    notes: '',
    payment_method: 'mpesa',
  });
  const [lineItems, setLineItems] = useState([
    { product_code: '', quantity: '', unit_price: '' }
  ]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await finishedGoodsAPI.getSummary();
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError(null);
  };

  const handleLineItemChange = (index, field, value) => {
    const newLineItems = [...lineItems];
    newLineItems[index][field] = value;

    // Auto-fill unit price when product is selected
    if (field === 'product_code' && value) {
      const selectedProduct = products.find(p => p.product_code === value);
      if (selectedProduct) {
        // You might want to have a selling price in your product info
        // For now, using a placeholder - this should come from product pricing
        newLineItems[index].unit_price = '100.00';
      }
    }

    setLineItems(newLineItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, {
      product_code: '',
      quantity: '',
      unit_price: ''
    }]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length > 1) {
      const newLineItems = lineItems.filter((_, i) => i !== index);
      setLineItems(newLineItems);
    }
  };

  const calculateTotal = () => {
    let total = 0;
    lineItems.forEach(item => {
      if (item.quantity && item.unit_price) {
        const qty = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.unit_price) || 0;
        total += qty * price;
      }
    });
    return total;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const validLineItems = lineItems.filter(
      item => item.product_code && item.quantity && item.unit_price
    );

    if (validLineItems.length === 0) {
      setError('Please add at least one valid line item');
      setLoading(false);
      return;
    }

    try {
      const dataToSend = {
        order_number: formData.order_number,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email || null,
        customer_phone: formData.customer_phone || null,
        order_date: formData.order_date,
        delivery_date: formData.delivery_date || null,
        shipping_address: formData.shipping_address || null,
        notes: formData.notes || null,
        payment_method: formData.payment_method || null,
        line_items: validLineItems.map(item => ({
          product_code: item.product_code,
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unit_price),
        })),
      };

      await salesAPI.create(dataToSend);

      setSuccess(true);
      setFormData({
        order_number: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        order_date: new Date().toISOString().split('T')[0],
        delivery_date: '',
        shipping_address: '',
        notes: '',
        payment_method: 'mpesa',
      });
      setLineItems([{ product_code: '', quantity: '', unit_price: '' }]);

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      console.error('Error creating sales order:', err);

      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;

        if (detail.insufficient_products) {
          let message = 'Insufficient inventory:\n\n';
          detail.insufficient_products.forEach(p => {
            message += `${p.product_name} (${p.product_code}):\n`;
            message += `  Required: ${p.required}\n`;
            message += `  Available: ${p.available}\n`;
            message += `  Shortage: ${p.shortage}\n\n`;
          });
          setError(message);
        } else if (typeof detail === 'string') {
          setError(detail);
        } else {
          setError('Validation error occurred');
        }
      } else {
        setError('Failed to create sales order');
      }
    } finally {
      setLoading(false);
    }
  };

  const total = calculateTotal();

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Create Sales Order</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="card border-red-200 bg-red-50 p-4">
            <div className="flex items-start space-x-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-semibold text-red-900">Error Creating Sales Order</p>
                <pre className="text-sm text-red-700 whitespace-pre-wrap">{error}</pre>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="card border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start space-x-3">
              <span className="text-xl">✓</span>
              <div>
                <p className="font-semibold text-emerald-900">Success!</p>
                <p className="text-sm text-emerald-700">Sales order created successfully</p>
              </div>
            </div>
          </div>
        )}

        {/* Order Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Order Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="order_number"
                value={formData.order_number}
                onChange={handleChange}
                required
                placeholder="e.g., SO-2024-001"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="order_date"
                value={formData.order_date}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Date
              </label>
              <input
                type="date"
                name="delivery_date"
                value={formData.delivery_date}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Customer Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="customer_email"
                value={formData.customer_email}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="customer_phone"
                value={formData.customer_phone}
                onChange={handleChange}
                placeholder="e.g., +254712345678"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shipping Address
            </label>
            <textarea
              name="shipping_address"
              value={formData.shipping_address}
              onChange={handleChange}
              rows="2"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              className="input-field"
            >
              <option value="mpesa">M-PESA</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="credit">Credit</option>
            </select>
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Products
            </h3>
            <button
              type="button"
              onClick={addLineItem}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              + Add Product
            </button>
          </div>

          {/* Column Headers */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 mb-2">
            <div className="col-span-5">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</label>
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</label>
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Unit Price (KES)</label>
            </div>
          </div>

          <div className="space-y-3">
            {lineItems.map((item, index) => (
              <div key={index} className="card p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">Item #{index + 1}</span>
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-5">
                    <select
                      value={item.product_code}
                      onChange={(e) => handleLineItemChange(index, 'product_code', e.target.value)}
                      className="input-field text-sm"
                      required
                    >
                      <option value="">Select product</option>
                      {products.map(product => (
                        <option key={product.product_code} value={product.product_code}>
                          {product.product_name} ({product.product_code}) - Available: {product.total_quantity}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <input
                      type="number"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                      className="input-field text-sm"
                      placeholder="Qty"
                      required
                      min="0.01"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <input
                      type="number"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => handleLineItemChange(index, 'unit_price', e.target.value)}
                      className="input-field text-sm"
                      placeholder="Price"
                      required
                      min="0.01"
                    />
                  </div>
                </div>

                {item.quantity && item.unit_price && (
                  <div className="mt-2 text-right text-sm text-gray-600">
                    Line Total: <span className="font-semibold">KES {(parseFloat(item.quantity) * parseFloat(item.unit_price)).toFixed(2)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="card p-4 bg-emerald-50 border border-emerald-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Order Total</p>
              <p className="text-2xl font-bold text-emerald-700">KES {total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Additional notes about this order..."
            className="input-field"
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center space-x-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <span>+</span>
                <span>Create Sales Order</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateSalesOrderForm;
