import React, { useState, useEffect } from 'react';
import { rawMaterialsAPI } from '../api';

function EditMaterialModal({ material, onClose, onSuccess }) {
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

  useEffect(() => {
    if (material) {
      setFormData({
        material_code: material.material_code || '',
        name: material.name || '',
        description: material.description || '',
        unit_of_measure: material.unit_of_measure || 'kg',
        category: material.category || '',
        minimum_stock_level: material.minimum_stock_level || '',
        reorder_point: material.reorder_point || '',
        standard_cost: material.standard_cost || '',
      });
    }
  }, [material]);

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

    try {
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

      await rawMaterialsAPI.update(material.id, dataToSend);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating material:', err);

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
      } else {
        setError('Failed to update material');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Raw Material</h2>
            <p className="text-sm text-gray-500 mt-1">Update material information</p>
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
                  <p className="font-semibold text-red-900">Error Updating Material</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="Enter material description..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="e.g., Metal, Plastic"
                  />
                </div>
              </div>
            </div>

            {/* Inventory Settings */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Inventory Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                </div>
              </div>
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
              className="btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <span>✓</span>
                  <span>Update Material</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditMaterialModal;