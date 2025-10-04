import React, { useState, useEffect } from 'react';
import { bomAPI, rawMaterialsAPI } from '../api';

function EditBOMModal({ bom, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    bom_number: '',
    product_name: '',
    product_code: '',
    version: '',
    status: 'draft',
    base_quantity: '1',
    unit_of_measure: 'piece',
  });
  const [lineItems, setLineItems] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMaterials();
    loadBOMData();
  }, [bom]);

  const fetchMaterials = async () => {
    try {
      const response = await rawMaterialsAPI.getAll();
      setMaterials(response.data);
    } catch (err) {
      console.error('Error fetching materials:', err);
    }
  };

  const loadBOMData = async () => {
    try {
      const response = await bomAPI.getDetails(bom.id);
      const bomData = response.data;

      setFormData({
        bom_number: bomData.bom.bom_number,
        product_name: bomData.bom.product_name,
        product_code: bomData.bom.product_code,
        version: bomData.bom.version,
        status: bomData.bom.status,
        base_quantity: String(bomData.bom.base_quantity),
        unit_of_measure: bomData.bom.unit_of_measure,
      });

      setLineItems(bomData.line_items.map(item => ({
        id: item.id,
        material_id: String(item.material_id),
        quantity_required: String(item.quantity_required),
        unit_of_measure: item.unit_of_measure,
        scrap_percentage: String(item.scrap_percentage),
        sequence_number: String(item.sequence_number || ''),
        notes: item.notes || '',
      })));
    } catch (err) {
      console.error('Error loading BOM details:', err);
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

    if (field === 'material_id' && value) {
      const selectedMaterial = materials.find(m => m.id === parseInt(value));
      if (selectedMaterial) {
        newLineItems[index].unit_of_measure = selectedMaterial.unit_of_measure;
      }
    }

    setLineItems(newLineItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, {
      material_id: '',
      quantity_required: '',
      unit_of_measure: '',
      scrap_percentage: '0',
      sequence_number: String(lineItems.length + 1),
      notes: ''
    }]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length > 1) {
      const newLineItems = lineItems.filter((_, i) => i !== index);
      newLineItems.forEach((item, i) => {
        item.sequence_number = String(i + 1);
      });
      setLineItems(newLineItems);
    }
  };

  const calculateTotalCost = () => {
    let total = 0;
    lineItems.forEach(item => {
      if (item.material_id && item.quantity_required) {
        const material = materials.find(m => m.id === parseInt(item.material_id));
        if (material && material.standard_cost) {
          const qty = parseFloat(item.quantity_required) || 0;
          const scrap = parseFloat(item.scrap_percentage) || 0;
          const actualQty = qty * (1 + scrap / 100);
          total += actualQty * parseFloat(material.standard_cost);
        }
      }
    });
    return total;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const validLineItems = lineItems.filter(
      item => item.material_id && item.quantity_required && item.unit_of_measure
    );

    if (validLineItems.length === 0) {
      setError('Please add at least one valid line item');
      setLoading(false);
      return;
    }

    try {
      // Delete old BOM and create new one (since we don't have an update endpoint)
      // This is a workaround - in production you'd want a proper update endpoint
      const dataToSend = {
        bom_number: formData.bom_number,
        product_name: formData.product_name,
        product_code: formData.product_code,
        version: formData.version,
        status: formData.status,
        base_quantity: parseFloat(formData.base_quantity),
        unit_of_measure: formData.unit_of_measure,
        line_items: validLineItems.map(item => ({
          material_id: parseInt(item.material_id),
          quantity_required: parseFloat(item.quantity_required),
          unit_of_measure: item.unit_of_measure,
          scrap_percentage: parseFloat(item.scrap_percentage) || 0,
          sequence_number: parseInt(item.sequence_number) || null,
          notes: item.notes || null,
        })),
      };

      // For now, we'll just show a message that editing requires deletion and recreation
      // In a production app, you'd add a PUT endpoint to the backend
      alert('Note: Editing will delete and recreate the BOM. Consider creating a new version instead.');

      await bomAPI.delete(bom.id);
      await bomAPI.create(dataToSend);

      onSuccess();
      onClose();

    } catch (err) {
      console.error('Error updating BOM:', err);

      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          setError(err.response.data.detail);
        } else {
          setError('Validation error occurred');
        }
      } else {
        setError('Failed to update BOM');
      }
    } finally {
      setLoading(false);
    }
  };

  const totalCost = calculateTotalCost();
  const costPerUnit = formData.base_quantity > 0 ? totalCost / parseFloat(formData.base_quantity) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Bill of Materials</h2>
            <p className="text-sm text-gray-500 mt-1">Update BOM information and materials</p>
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
                  <p className="font-semibold text-red-900">Error Updating BOM</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Product Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Product Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BOM Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bom_number"
                    value={formData.bom_number}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="product_code"
                    value={formData.product_code}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Version <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="version"
                    value={formData.version}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="base_quantity"
                    value={formData.base_quantity}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>

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
                    <option value="piece">Piece (pc)</option>
                    <option value="box">Box</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="liter">Liter (L)</option>
                    <option value="meter">Meter (m)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="obsolete">Obsolete</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Materials Required */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Materials Required
                </h3>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  + Add Material
                </button>
              </div>

              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div key={index} className="card p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-700">#{item.sequence_number}</span>
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
                      <div className="md:col-span-4">
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

                      <div className="md:col-span-2">
                        <input
                          type="number"
                          step="0.0001"
                          value={item.quantity_required}
                          onChange={(e) => handleLineItemChange(index, 'quantity_required', e.target.value)}
                          className="input-field text-sm"
                          placeholder="Qty"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <input
                          type="text"
                          value={item.unit_of_measure}
                          className="input-field text-sm"
                          readOnly
                        />
                      </div>

                      <div className="md:col-span-2">
                        <input
                          type="number"
                          step="0.1"
                          value={item.scrap_percentage}
                          onChange={(e) => handleLineItemChange(index, 'scrap_percentage', e.target.value)}
                          className="input-field text-sm"
                          placeholder="Scrap %"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <input
                          type="number"
                          value={item.sequence_number}
                          onChange={(e) => handleLineItemChange(index, 'sequence_number', e.target.value)}
                          className="input-field text-sm"
                          placeholder="Seq"
                        />
                      </div>
                    </div>

                    <div className="mt-2">
                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) => handleLineItemChange(index, 'notes', e.target.value)}
                        className="input-field text-sm"
                        placeholder="Notes (optional)"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Cost Summary */}
              <div className="card p-4 bg-emerald-50 border border-emerald-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Cost</p>
                    <p className="text-xl font-bold text-emerald-700">${totalCost.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Cost Per Unit</p>
                    <p className="text-xl font-bold text-emerald-800">${costPerUnit.toFixed(2)}</p>
                  </div>
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
                  <span>Update BOM</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBOMModal;