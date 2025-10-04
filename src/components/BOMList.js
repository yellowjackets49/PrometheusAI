import React, { useState, useEffect } from 'react';
import { bomAPI } from '../api';
import ViewBOMModal from './ViewBOMModal';
import EditBOMModal from './EditBOMModal';

function BOMList({ refreshTrigger }) {
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewingBOM, setViewingBOM] = useState(null);
  const [editingBOM, setEditingBOM] = useState(null);

  useEffect(() => {
    fetchBOMs();
  }, [refreshTrigger]);

  const fetchBOMs = async () => {
    try {
      setLoading(true);
      const response = await bomAPI.getAll();
      setBoms(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch BOMs');
      console.error('Error fetching BOMs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, bomNumber) => {
    if (window.confirm(`Are you sure you want to delete BOM ${bomNumber}?`)) {
      try {
        await bomAPI.delete(id);
        fetchBOMs();
      } catch (err) {
        alert('Failed to delete BOM');
        console.error('Error deleting BOM:', err);
      }
    }
  };

  const handleViewDetails = async (bom) => {
    try {
      const response = await bomAPI.getDetails(bom.id);
      setViewingBOM(response.data);
    } catch (err) {
      alert('Failed to load BOM details');
      console.error('Error loading BOM details:', err);
    }
  };

  const handleEdit = (bom) => {
    setEditingBOM(bom);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await bomAPI.updateStatus(id, newStatus);
      fetchBOMs();
    } catch (err) {
      alert('Failed to update BOM status');
      console.error('Error updating BOM status:', err);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-emerald-100 text-emerald-700',
      draft: 'bg-gray-100 text-gray-700',
      obsolete: 'bg-red-100 text-red-700',
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const filteredBOMs = boms.filter(bom => {
    const matchesSearch =
      bom.bom_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bom.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bom.product_code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' || bom.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-lg text-gray-500">Loading BOMs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-red-200 bg-red-50 p-6">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-red-900">Error Loading BOMs</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="card p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by BOM number, product name, or code..."
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
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="obsolete">Obsolete</option>
              </select>

              <span className="text-sm text-gray-500">
                {filteredBOMs.length} of {boms.length} BOMs
              </span>
            </div>
          </div>
        </div>

        {/* BOMs Grid */}
        {filteredBOMs.length === 0 ? (
          <div className="card p-12 text-center">
            <span className="text-6xl mb-4 block">📋</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No BOMs found</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first Bill of Materials to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBOMs.map((bom) => (
              <div key={bom.id} className="card p-6 hover:shadow-lg transition-all duration-200">
                {/* BOM Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {bom.bom_number}
                      </span>
                      <span className={`badge ${getStatusBadge(bom.status)}`}>
                        {bom.status}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        v{bom.version}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {bom.product_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Product Code: {bom.product_code}
                    </p>
                  </div>
                </div>

                {/* BOM Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Base Quantity</span>
                    <span className="font-medium text-gray-900">
                      {bom.base_quantity} {bom.unit_of_measure}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Created</span>
                    <span className="font-medium text-gray-900">
                      {new Date(bom.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleViewDetails(bom)}
                      className="text-sm text-gray-600 hover:text-emerald-600 font-medium transition-colors"
                    >
                      View
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => handleEdit(bom)}
                      className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    {bom.status === 'active' && (
                      <button
                        onClick={() => handleStatusChange(bom.id, 'obsolete')}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        Obsolete
                      </button>
                    )}
                    {bom.status === 'draft' && (
                      <button
                        onClick={() => handleStatusChange(bom.id, 'active')}
                        className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors"
                      >
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(bom.id, bom.bom_number)}
                      className="text-sm text-gray-600 hover:text-red-600 font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {viewingBOM && (
        <ViewBOMModal
          bomData={viewingBOM}
          onClose={() => setViewingBOM(null)}
          onRefresh={fetchBOMs}
        />
      )}

      {editingBOM && (
        <EditBOMModal
          bom={editingBOM}
          onClose={() => setEditingBOM(null)}
          onSuccess={() => {
            setEditingBOM(null);
            fetchBOMs();
          }}
        />
      )}
    </>
  );
}

export default BOMList;