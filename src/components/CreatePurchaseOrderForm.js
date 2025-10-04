import React, { useState, useEffect } from 'react';
import { purchaseOrdersAPI, suppliersAPI, rawMaterialsAPI } from '../api';

function CreatePurchaseOrderForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    po_number: '',
    supplier_id: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    notes: '',
  });
  const [lineItems, setLineItems] = useState([
    { material_id: '', quantity_ordered: '', unit_price: '' }
  ]);
  const [suppliers, setSuppliers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSuppliers();
    fetchMaterials();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await suppliersAPI.getAll();
      setSuppliers(response.data.filter(s => s.is_active));
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await rawMaterialsAPI.getAll();
      setMaterials(response.data);
    } catch (err) {
      console.error('Error fetching materials:', err);
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
    setLineItems(newLineItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { material_id: '', quantity_ordered: '', unit_price: '' }]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length > 1) {
      const newLineItems = lineItems.filter((_, i) => i !== index);
      setLineItems(newLineItems);
    }
  };

  const calculateTotal = () => {
    return lineItems.reduce((total, item) => {
      const qty = parseFloat(item.quantity_ordered) || 0;
      const price = parseFloat(item.unit_price) || 0;
      return total + (qty * price);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validate line items
    const validLineItems = lineItems.filter(
      item => item.material_id && item.quantity_ordered && item.unit_price
    );

    if (validLineItems.length === 0) {
      setError('Please add at least one valid line item');
      setLoading(false);
      return;
    }

    try {
      const dataToSend = {
        po_number: formData.po_number,
        supplier_id: parseInt(formData.supplier_id),
        order_date: formData.order_date,
        expected_delivery_date: formData.expected_delivery_date || null,
        notes: formData.notes || null,
        line_items: validLineItems.map(item => ({
          material_id: parseInt(item.material_id),
          quantity_ordered: parseFloat(item.quantity_ordered),
          unit_price: parseFloat(item.unit_price),
        })),
      };

      await purchaseOrdersAPI.create(dataToSend);

      setSuccess(true);

      // Reset form
      setFormData({
        po_number: '',
        supplier_id: '',
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery_date: '',
        notes: '',
      });
      setLineItems([{ material_id: '', quantity_ordered: '', unit_price: '' }]);

      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (err) {
      console.error('Error creating purchase order:', err);

      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          setError(err.response.data.detail);
        } else {
          setError('Validation error occurred');
        }
      } else {
        setError('Failed to create purchase order');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      po_number: '',
      supplier_id: '',
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery_date: '',
      notes: '',
    });
    setLineItems([{ material_id: '', quantity_ordered: '', unit_price: '' }]);
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {success && (
        <div className="card border-emerald-200 bg-emerald-50 p-6 mb-6 animate-pulse">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">✅</span>
            <div>
              <p className="font-semibold text-emerald-900">Purchase Order Created Successfully!</p>
              <p className="text-sm text-emerald-700">Redirecting to purchase orders list...</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="card border-red-200 bg-red-50 p-6 mb-6">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-red-900">Error Creating Purchase Order</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="card p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Create Purchase Order</h2>
          <p className="text-gray-500">Order materials from your suppliers</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Order Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PO Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="po_number"
                  value={formData.po_number}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="e.g., PO-2025-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier <span className="text-red-500">*</span>
                </label>
                <select
                  name="supplier_id"
                  value={formData.supplier_id}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  <option value="">Select a supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name} ({supplier.supplier_code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  name="expected_delivery_date"
                  value={formData.expected_delivery_date}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="input-field"
                placeholder="Any additional notes about this order..."
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Order Items
              </h3>
              <button
                type="button"
                onClick={addLineItem}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center space-x-1"
              >
                <span>+</span>
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-4">
              {lineItems.map((item, index) => (
                <div key={index} className="card p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-5">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Material
                      </label>
                      <select
                        value={item.material_id}
                        onChange={(e) => handleLineItemChange(index, 'material_id', e.target.value)}
                        className="input-field text-sm"
                        required
                      >
                        <option value="">Select material</option>
                        {materials.map(material => (
                          <option key={material.id} value={material.id}>
                            {material.name} ({material.material_code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.quantity_ordered}
                        onChange={(e) => handleLineItemChange(index, 'quantity_ordered', e.target.value)}
                        className="input-field text-sm"
                        placeholder="100"
                        required
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Unit Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handleLineItemChange(index, 'unit_price', e.target.value)}
                        className="input-field text-sm"
                        placeholder="5.50"
                        required
                      />
                    </div>

                    <div className="md:col-span-1 flex items-end">
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="w-full btn-secondary text-sm py-2"
                          title="Remove item"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>

                  {item.quantity_ordered && item.unit_price && (
                    <div className="mt-2 text-right text-sm">
                      <span className="text-gray-600">Line Total: </span>
                      <span className="font-semibold text-gray-900">
                        ${(parseFloat(item.quantity_ordered) * parseFloat(item.unit_price)).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="card p-4 bg-emerald-50 border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                <span className="text-2xl font-bold text-emerald-600">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClear}
              className="btn-secondary"
              disabled={loading}
            >
              Clear Form
            </button>
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
                  <span>✓</span>
                  <span>Create Purchase Order</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePurchaseOrderForm;