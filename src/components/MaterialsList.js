import React, { useState, useEffect } from 'react';
import { rawMaterialsAPI } from '../api';
import EditMaterialModal from './EditMaterialModal';

function MaterialsList({ refreshTrigger }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMaterial, setEditingMaterial] = useState(null);

  useEffect(() => {
    fetchMaterials();
  }, [refreshTrigger]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await rawMaterialsAPI.getAll();
      setMaterials(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch materials');
      console.error('Error fetching materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, materialCode) => {
    if (window.confirm(`Are you sure you want to delete ${materialCode}?`)) {
      try {
        await rawMaterialsAPI.delete(id);
        fetchMaterials();
      } catch (err) {
        alert('Failed to delete material');
        console.error('Error deleting material:', err);
      }
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
  };

  const handleCloseModal = () => {
    setEditingMaterial(null);
  };

  const handleEditSuccess = () => {
    fetchMaterials();
    setEditingMaterial(null);
  };

  // Filter materials based on search
  const filteredMaterials = materials.filter(material =>
    material.material_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-lg text-gray-500">Loading materials...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-red-200 bg-red-50 p-6">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-red-900">Error Loading Materials</p>
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
                  placeholder="Search materials by code, name, or category..."
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
                {filteredMaterials.length} of {materials.length} materials
              </span>
              <button className="btn-secondary text-sm">
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Materials Grid */}
        {filteredMaterials.length === 0 ? (
          <div className="card p-12 text-center">
            <span className="text-6xl mb-4 block">📦</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No materials found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search' : 'Add your first material to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
              <div key={material.id} className="card p-6 hover:shadow-lg transition-all duration-200">
                {/* Material Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        {material.material_code}
                      </span>
                      {material.category && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {material.category}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {material.name}
                    </h3>
                    {material.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {material.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Material Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Unit of Measure</span>
                    <span className="font-medium text-gray-900">{material.unit_of_measure}</span>
                  </div>

                  {material.standard_cost && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Standard Cost</span>
                      <span className="font-semibold text-emerald-600">
                        ${parseFloat(material.standard_cost).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Min Stock Level</span>
                    <span className="font-medium text-gray-900">
                      {material.minimum_stock_level || 'Not set'}
                    </span>
                  </div>

                  {material.reorder_point && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Reorder Point</span>
                      <span className="font-medium text-gray-900">
                        {material.reorder_point}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => handleEdit(material)}
                    className="text-sm text-gray-600 hover:text-emerald-600 font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(material.id, material.material_code)}
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
      {editingMaterial && (
        <EditMaterialModal
          material={editingMaterial}
          onClose={handleCloseModal}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}

export default MaterialsList;