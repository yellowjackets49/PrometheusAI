import React, { useState, useEffect } from 'react';
import { suppliersAPI } from '../api';
import EditSupplierModal from './EditSupplierModal';

function SuppliersList({ refreshTrigger }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSupplier, setEditingSupplier] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, [refreshTrigger]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await suppliersAPI.getAll();
      setSuppliers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch suppliers');
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, supplierName) => {
    if (window.confirm(`Are you sure you want to delete ${supplierName}?`)) {
      try {
        await suppliersAPI.delete(id);
        fetchSuppliers();
      } catch (err) {
        alert('Failed to delete supplier');
        console.error('Error deleting supplier:', err);
      }
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await suppliersAPI.toggleActive(id);
      fetchSuppliers();
    } catch (err) {
      alert('Failed to update supplier status');
      console.error('Error toggling supplier status:', err);
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
  };

  const handleCloseModal = () => {
    setEditingSupplier(null);
  };

  const handleEditSuccess = () => {
    fetchSuppliers();
    setEditingSupplier(null);
  };

  // Filter suppliers based on search
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.supplier_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-lg text-gray-500">Loading suppliers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-red-200 bg-red-50 p-6">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-red-900">Error Loading Suppliers</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Search and Actions Bar */}
        <div className="card p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search suppliers by code, name, or contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  🔍
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                {filteredSuppliers.length} of {suppliers.length} suppliers
              </span>
              <button className="btn-secondary text-sm">
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Suppliers Grid */}
        {filteredSuppliers.length === 0 ? (
          <div className="card p-12 text-center">
            <span className="text-6xl mb-4 block">🏢</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No suppliers found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search' : 'Add your first supplier to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSuppliers.map((supplier) => (
              <div key={supplier.id} className="card p-6 hover:shadow-lg transition-all duration-200">
                {/* Supplier Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        {supplier.supplier_code}
                      </span>
                      <span className={`badge ${
                        supplier.is_active 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {supplier.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {supplier.name}
                    </h3>
                  </div>
                </div>

                {/* Supplier Details */}
                <div className="space-y-3 mb-4">
                  {supplier.contact_person && (
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-400">👤</span>
                      <span className="text-gray-600">Contact:</span>
                      <span className="font-medium text-gray-900">{supplier.contact_person}</span>
                    </div>
                  )}

                  {supplier.email && (
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-400">📧</span>
                      <span className="text-gray-600">Email:</span>
                      <a href={`mailto:${supplier.email}`} className="font-medium text-emerald-600 hover:underline">
                        {supplier.email}
                      </a>
                    </div>
                  )}

                  {supplier.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-400">📞</span>
                      <span className="text-gray-600">Phone:</span>
                      <a href={`tel:${supplier.phone}`} className="font-medium text-gray-900">
                        {supplier.phone}
                      </a>
                    </div>
                  )}

                  {supplier.address && (
                    <div className="flex items-start space-x-2 text-sm">
                      <span className="text-gray-400 mt-0.5">📍</span>
                      <div className="flex-1">
                        <span className="text-gray-600">Address:</span>
                        <p className="font-medium text-gray-900 mt-1">
                          {supplier.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleToggleActive(supplier.id)}
                      className="text-sm text-gray-600 hover:text-emerald-600 font-medium transition-colors"
                    >
                      {supplier.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleEdit(supplier)}
                      className="text-sm text-gray-600 hover:text-emerald-600 font-medium transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                  <button
                    onClick={() => handleDelete(supplier.id, supplier.name)}
                    className="text-sm text-gray-600 hover:text-red-600 font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingSupplier && (
        <EditSupplierModal
          supplier={editingSupplier}
          onClose={handleCloseModal}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}

export default SuppliersList;