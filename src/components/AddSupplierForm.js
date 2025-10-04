import React, { useState } from 'react';
import { suppliersAPI } from '../api';

function AddSupplierForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    supplier_code: '',
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
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
        supplier_code: formData.supplier_code,
        name: formData.name,
        contact_person: formData.contact_person || null,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        is_active: formData.is_active,
      };

      await suppliersAPI.create(dataToSend);

      setSuccess(true);

      setFormData({
        supplier_code: '',
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        is_active: true,
      });

      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (err) {
      console.error('Error adding supplier:', err);

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
        setError('Failed to add supplier');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      supplier_code: '',
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      is_active: true,
    });
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {success && (
        <div className="card border-emerald-200 bg-emerald-50 p-6 mb-6 animate-pulse">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">✅</span>
            <div>
              <p className="font-semibold text-emerald-900">Supplier Added Successfully!</p>
              <p className="text-sm text-emerald-700">Redirecting to suppliers list...</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="card border-red-200 bg-red-50 p-6 mb-6">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-red-900">Error Adding Supplier</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="card p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Supplier Information</h2>
          <p className="text-gray-500">Fill in the details below to add a new supplier</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="supplier_code"
                  value={formData.supplier_code}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="e.g., SUP001"
                />
                <p className="text-xs text-gray-500 mt-1">Unique identifier for this supplier</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="e.g., ABC Manufacturing Co."
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Contact Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person
                </label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., contact@supplier.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., +1-555-0100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex items-center space-x-3 h-11">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <label className="text-sm text-gray-700">
                    Active Supplier
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="input-field"
                placeholder="Enter supplier's full address..."
              />
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
                  <span>Add Supplier</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddSupplierForm;