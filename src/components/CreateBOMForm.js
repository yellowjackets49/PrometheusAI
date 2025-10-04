import React, { useState, useEffect } from 'react';
import { bomAPI, rawMaterialsAPI } from '../api';

function CreateBOMForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    bom_number: '',
    product_name: '',
    product_code: '',
    version: '1.0',
    status: 'draft',
    base_quantity: '1',
    unit_of_measure: 'piece',
  });
  const [lineItems, setLineItems] = useState([
    { material_id: '', quantity_required: '', unit_of_measure: '', scrap_percentage: '0', sequence_number: '1', notes: '' }
  ]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

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

    // Auto-fill unit of measure when material is selected
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
      // Renumber sequence
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
    setSuccess(false);

    // Validate line items
    const validLineItems = lineItems.filter(
      item => item.material_id && item.quantity_required && item.unit_of_measure
    );

    if (validLineItems.length === 0) {
      setError('Please add at least one valid line item');
      setLoading(false);
      return;
    }

    try {
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

      await bomAPI.create(dataToSend);

      setSuccess(true);

      // Reset form
      setFormData({
        bom_number: '',
        product_name: '',
        product_code: '',
        version: '1.0',
        status: 'draft',
        base_quantity: '1',
        unit_of_measure: 'piece',
      });
      setLineItems([
        { material_id: '', quantity_required: '', unit_of_measure: '', scrap_percentage: '0', sequence_number: '1', notes: '' }
      ]);

      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (err) {
      console.error('Error creating BOM:', err);

      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          setError(err.response.data.detail);
        } else {
          setError('Validation error occurred');
        }
      } else {
        setError('Failed to create BOM');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      bom_number: '',
      product_name: '',
      product_code: '',
      version: '1.0',
      status: 'draft',
      base_quantity: '1',
      unit_of_measure: 'piece',
    });
    setLineItems([
      { material_id: '', quantity_required: '', unit_of_measure: '', scrap_percentage: '0', sequence_number: '1', notes: '' }
    ]);
    setError(null);
    setSuccess(false);
  };

  const totalCost = calculateTotalCost();
  const costPerUnit = formData.base_quantity > 0 ? totalCost / parseFloat(formData.base_quantity) : 0;

  return (
    <div className="max-w-6xl mx-auto">
      {success && (
        <div className="card border-emerald-200 bg-emerald-50 p-6 mb-6 animate-pulse">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">✅</span>
            <div>
              <p className="font-semibold text-emerald-900">BOM Created Successfully!</p>
              <p className="text-sm text-emerald-700">Redirecting to BOMs list...</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="card border-red-200 bg-red-50 p-6 mb-6">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-red-900">Error Creating BOM</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="card p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Create Bill of Materials</h2>
          <p className="text-gray-500">Define the materials required to manufacture your products</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Product Information */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Product Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  placeholder="e.g., BOM-001"
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
                  placeholder="e.g., PROD-001"
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
                  placeholder="e.g., 1.0"
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
                placeholder="e.g., Widget Assembly Type A"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  placeholder="1"
                />
                <p className="text-xs text-gray-500 mt-1">Quantity this BOM produces</p>
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
          <div className="space-y-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Materials Required
                </h3>
                <p className="text-xs text-gray-500 mt-1">Add the raw materials needed to produce this product</p>
              </div>
              <button
                type="button"
                onClick={addLineItem}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center space-x-1"
              >
                <span>+</span>
                <span>Add Material</span>
              </button>
            </div>

            <div className="space-y-4">
              {lineItems.map((item, index) => (
                <div key={index} className="card p-5 bg-gray-50">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-sm font-semibold text-gray-700">Material #{item.sequence_number}</span>
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-4">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Material *
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

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={item.quantity_required}
                        onChange={(e) => handleLineItemChange(index, 'quantity_required', e.target.value)}
                        className="input-field text-sm"
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Unit
                      </label>
                      <input
                        type="text"
                        value={item.unit_of_measure}
                        onChange={(e) => handleLineItemChange(index, 'unit_of_measure', e.target.value)}
                        className="input-field text-sm"
                        placeholder="kg"
                        readOnly
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Scrap %
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={item.scrap_percentage}
                        onChange={(e) => handleLineItemChange(index, 'scrap_percentage', e.target.value)}
                        className="input-field text-sm"
                        placeholder="0"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Seq #
                      </label>
                      <input
                        type="number"
                        value={item.sequence_number}
                        onChange={(e) => handleLineItemChange(index, 'sequence_number', e.target.value)}
                        className="input-field text-sm"
                        placeholder="1"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => handleLineItemChange(index, 'notes', e.target.value)}
                      className="input-field text-sm"
                      placeholder="e.g., Use only premium grade..."
                    />
                  </div>

                  {item.material_id && item.quantity_required && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      {(() => {
                        const material = materials.find(m => m.id === parseInt(item.material_id));
                        if (material && material.standard_cost) {
                          const qty = parseFloat(item.quantity_required) || 0;
                          const scrap = parseFloat(item.scrap_percentage) || 0;
                          const actualQty = qty * (1 + scrap / 100);
                          const lineCost = actualQty * parseFloat(material.standard_cost);
                          return (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                Actual qty: {actualQty.toFixed(4)} {item.unit_of_measure} @ ${parseFloat(material.standard_cost).toFixed(2)}
                              </span>
                              <span className="font-semibold text-emerald-600">
                                Line Cost: ${lineCost.toFixed(2)}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Cost Summary */}
            <div className="card p-6 bg-emerald-50 border border-emerald-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Material Cost</p>
                  <p className="text-3xl font-bold text-emerald-700">${totalCost.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    For {formData.base_quantity} {formData.unit_of_measure}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cost Per Unit</p>
                  <p className="text-3xl font-bold text-emerald-800">${costPerUnit.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Per {formData.unit_of_measure}
                  </p>
                </div>
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
                  <span>Create BOM</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateBOMForm;