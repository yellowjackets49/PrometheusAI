import React, { useState } from 'react';
import { rawMaterialsAPI } from '../api';

function AddMaterialForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    material_code: '',
    name: '',
    description: '',
    unit_of_measure: 'kg',
    category: '',
    minimum_stock_level: '',
    reorder_point: '',
    standard_cost: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Prepare data - convert empty strings to null for optional fields
      const dataToSend = {
        material_code: formData.material_code,
        name: formData.name,
        description: formData.description || null,
        unit_of_measure: formData.unit_of_measure,
        category: formData.category || null,
        minimum_stock_level: formData.minimum_stock_level ? parseFloat(formData.minimum_stock_level) : null,
        reorder_point: formData.reorder_point ? parseFloat(formData.reorder_point) : null,
        standard_cost: formData.standard_cost ? parseFloat(formData.standard_cost) : null,
      };

      await rawMaterialsAPI.create(dataToSend);

      // Show success message
      setSuccess(true);

      // Reset form
      setFormData({
        material_code: '',
        name: '',
        description: '',
        unit_of_measure: 'kg',
        category: '',
        minimum_stock_level: '',
        reorder_point: '',
        standard_cost: '',
      });

      // Redirect after 1.5 seconds
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (err) {
      console.error('Error adding material:', err);

      // Better error handling
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          const errorMessages = err.response.data.detail.map(e =>
            `${e.loc[e.loc.length - 1]}: ${e.msg}`
          ).join(', ');
          setError(errorMessages);
        } else if (typeof err.response.data.detail === 'string') {
          setError(err.response.data.detail);
        } else {
          setError('Validation error occurred');
        }
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to add material');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      material_code: '',
      name: '',
      description: '',
      unit_of_measure: 'kg',
      category: '',
      minimum_stock_level: '',
      reorder_point: '',
      standard_cost: '',
    });
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Success Message */}
      {success && (
        <div className="card border-emerald-200 bg-emerald-50 p-6 mb-6 animate-pulse">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">✅</span>
            <div>
              <p className="font-semibold text-emerald-900">Material Added Successfully!</p>
              <p className="text-sm text-emerald-700">Redirecting to materials list...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="card border-red-200 bg-red-50 p-6 mb-6">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-red-900">Error Adding Material</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="card p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Material Information</h2>
          <p className="text-gray-500">Fill in the details below to add a new raw material</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="material_code"
                  value={formData.material_code}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="e.g., RM001"
                />
                <p className="text-xs text-gray-500 mt-1">Unique identifier for this material</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="e.g., Steel Sheet"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="input-field"
                placeholder="Enter material description, specifications, or notes..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit of Measure <span className="text-red-500">*</span>
                </label>
                <select
                  name="unit_of_measure"
                  value={formData.unit_of_measure}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="meter">Meter (m)</option>
                  <option value="liter">Liter (L)</option>
                  <option value="piece">Piece (pc)</option>
                  <option value="box">Box</option>
                  <option value="ton">Ton</option>
                  <option value="roll">Roll</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Metal, Plastic, Chemical"
                />
              </div>
            </div>
          </div>

          {/* Inventory Settings */}
          <div className="space-y-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Inventory Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Stock Level
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="minimum_stock_level"
                  value={formData.minimum_stock_level}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="100"
                />
                <p className="text-xs text-gray-500 mt-1">Alert when stock falls below this</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reorder Point
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="reorder_point"
                  value={formData.reorder_point}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="150"
                />
                <p className="text-xs text-gray-500 mt-1">Trigger purchase order at this level</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Standard Cost ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="standard_cost"
                  value={formData.standard_cost}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="5.50"
                />
                <p className="text-xs text-gray-500 mt-1">Cost per unit</p>
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
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <span>✓</span>
                  <span>Add Material</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMaterialForm;