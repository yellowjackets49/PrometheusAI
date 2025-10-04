import React, { useState } from 'react';
import { inventoryAPI } from '../api';

function AdjustInventoryModal({ material, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    adjustment_type: 'add',
    quantity: '',
    reason: '',
    batch_number: '',
    storage_location: 'Main Warehouse',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      setError('Please enter a valid quantity');
      setLoading(false);
      return;
    }

    if (!formData.reason.trim()) {
      setError('Please provide a reason for the adjustment');
      setLoading(false);
      return;
    }

    try {
      await inventoryAPI.adjust({
        material_id: material.material_id,
        quantity: parseFloat(formData.quantity),
        adjustment_type: formData.adjustment_type,
        reason: formData.reason,
        batch_number: formData.batch_number || null,
        storage_location: formData.storage_location,
      });

      alert(`Inventory ${formData.adjustment_type === 'add' ? 'added' : 'removed'} successfully!`);
      onSuccess();
    } catch (err) {
      console.error('Error adjusting inventory:', err);
      setError(err.response?.data?.detail || 'Failed to adjust inventory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Adjust Inventory</h2>
            <p className="text-sm text-gray-500 mt-1">
              {material.material_code} - {material.material_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="card border-red-200 bg-red-50 p-4 mb-6">
              <div className="flex items-start space-x-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-semibold text-red-900">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Current Stock Info */}
          <div className="card p-4 bg-gray-50 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Stock:</span>
              <span className="text-lg font-semibold text-gray-900">
                {material.total_quantity.toFixed(2)} {material.unit_of_measure}
              </span>
            </div>
          </div>

          <div className="space-y-5">
            {/* Adjustment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adjustment Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, adjustment_type: 'add' })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.adjustment_type === 'add'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl mb-2 block">➕</span>
                  <p className="font-medium text-gray-900">Add Stock</p>
                  <p className="text-xs text-gray-500">Increase inventory</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, adjustment_type: 'remove' })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.adjustment_type === 'remove'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl mb-2 block">➖</span>
                  <p className="font-medium text-gray-900">Remove Stock</p>
                  <p className="text-xs text-gray-500">Decrease inventory</p>
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  className="input-field pr-20"
                  placeholder="0.00"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  {material.unit_of_measure}
                </span>
              </div>
            </div>

            {/* Storage Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Storage Location <span className="text-red-500">*</span>
              </label>
              <select
                name="storage_location"
                value={formData.storage_location}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="Main Warehouse">Main Warehouse</option>
                <option value="Secondary Storage">Secondary Storage</option>
                <option value="Production Floor">Production Floor</option>
                <option value="Quality Control">Quality Control</option>
              </select>
            </div>

            {/* Batch Number (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Number (Optional)
              </label>
              <input
                type="text"
                name="batch_number"
                value={formData.batch_number}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., BATCH-2025-001"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to adjust default batch</p>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                rows="3"
                className="input-field"
                placeholder="Explain why this adjustment is being made..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`btn-primary flex items-center space-x-2 ${
                formData.adjustment_type === 'remove' ? 'bg-red-600 hover:bg-red-700' : ''
              }`}
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{formData.adjustment_type === 'add' ? '➕' : '➖'}</span>
                  <span>{formData.adjustment_type === 'add' ? 'Add' : 'Remove'} Stock</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdjustInventoryModal;