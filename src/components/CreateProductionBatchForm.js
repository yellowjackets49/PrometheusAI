import React, { useState, useEffect } from 'react';
import { productionAPI, bomAPI } from '../api';

function CreateProductionBatchForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    batch_number: '',
    bom_id: '',
    planned_quantity: '1',
    production_line: '',
    supervisor: '',
    notes: '',
  });
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchBOMs();
  }, []);

  const fetchBOMs = async () => {
    try {
      const response = await bomAPI.getAll();
      // Only show active BOMs
      const activeBOMs = response.data.filter(bom => bom.status === 'active');
      setBoms(activeBOMs);
    } catch (err) {
      console.error('Error fetching BOMs:', err);
    }
  };

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
    setSuccess(false);

    try {
      const dataToSend = {
        batch_number: formData.batch_number,
        bom_id: parseInt(formData.bom_id),
        planned_quantity: parseFloat(formData.planned_quantity),
        production_line: formData.production_line || null,
        supervisor: formData.supervisor || null,
        notes: formData.notes || null,
      };

      await productionAPI.create(dataToSend);

      setSuccess(true);
      setFormData({
        batch_number: '',
        bom_id: '',
        planned_quantity: '1',
        production_line: '',
        supervisor: '',
        notes: '',
      });

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      console.error('Error creating production batch:', err);

      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          setError(err.response.data.detail);
        } else {
          setError('Validation error occurred');
        }
      } else {
        setError('Failed to create production batch');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedBOM = boms.find(b => b.id === parseInt(formData.bom_id));

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Create Production Batch</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="card border-red-200 bg-red-50 p-4">
            <div className="flex items-start space-x-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-semibold text-red-900">Error Creating Production Batch</p>
                <p className="text-sm text-red-700">{error}</p>
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
                <p className="text-sm text-emerald-700">Production batch created successfully</p>
              </div>
            </div>
          </div>
        )}

        {/* Batch Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Batch Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="batch_number"
                value={formData.batch_number}
                onChange={handleChange}
                required
                placeholder="e.g., BATCH-2024-001"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Planned Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="planned_quantity"
                value={formData.planned_quantity}
                onChange={handleChange}
                required
                min="0.01"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select BOM (Product) <span className="text-red-500">*</span>
            </label>
            <select
              name="bom_id"
              value={formData.bom_id}
              onChange={handleChange}
              required
              className="input-field"
            >
              <option value="">-- Select a BOM --</option>
              {boms.map(bom => (
                <option key={bom.id} value={bom.id}>
                  {bom.product_name} ({bom.product_code}) - v{bom.version}
                </option>
              ))}
            </select>
            {selectedBOM && (
              <p className="text-xs text-gray-500 mt-1">
                BOM #{selectedBOM.bom_number} | Base Qty: {selectedBOM.base_quantity} {selectedBOM.unit_of_measure}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Production Line
              </label>
              <input
                type="text"
                name="production_line"
                value={formData.production_line}
                onChange={handleChange}
                placeholder="e.g., Line A"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supervisor
              </label>
              <input
                type="text"
                name="supervisor"
                value={formData.supervisor}
                onChange={handleChange}
                placeholder="e.g., John Smith"
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
              placeholder="Additional notes about this production batch..."
              className="input-field"
            />
          </div>
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
                <span>Create Production Batch</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateProductionBatchForm;
