import React, { useState, useEffect } from 'react';
import { productionAPI, bomAPI } from '../api';

function ProductionBatchList({ refreshTrigger }) {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchDetails, setBatchDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actualQuantity, setActualQuantity] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, [refreshTrigger]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await productionAPI.getAll();
      setBatches(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching production batches:', err);
      setError('Failed to load production batches');
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchDetails = async (batchId) => {
    try {
      const response = await productionAPI.getDetails(batchId);
      setBatchDetails(response.data);
      setSelectedBatch(batches.find(b => b.id === batchId));
      setActualQuantity(response.data.batch.planned_quantity.toString());
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error fetching batch details:', err);
      alert('Failed to load batch details');
    }
  };

  const handleStartProduction = async (batchId) => {
    if (!window.confirm('Start this production batch? This will deduct raw materials from inventory.')) {
      return;
    }

    try {
      setActionLoading(true);
      await productionAPI.start(batchId);
      alert('Production started successfully! Raw materials have been deducted from inventory.');
      await fetchBatches();
      if (showDetailsModal && selectedBatch?.id === batchId) {
        await fetchBatchDetails(batchId);
      }
    } catch (err) {
      console.error('Error starting production:', err);

      if (err.response?.data?.detail?.insufficient_materials) {
        const materials = err.response.data.detail.insufficient_materials;
        let message = 'Insufficient materials to start production:\n\n';
        materials.forEach(m => {
          message += `${m.material_name} (${m.material_code}):\n`;
          message += `  Required: ${m.required}\n`;
          message += `  Available: ${m.available}\n`;
          message += `  Shortage: ${m.shortage}\n\n`;
        });
        alert(message);
      } else {
        alert(err.response?.data?.detail?.message || 'Failed to start production');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteProduction = async () => {
    if (!selectedBatch || !actualQuantity) {
      alert('Please enter actual quantity produced');
      return;
    }

    if (!window.confirm(`Complete production with actual quantity of ${actualQuantity}? This will add finished goods to inventory.`)) {
      return;
    }

    try {
      setActionLoading(true);
      await productionAPI.complete(selectedBatch.id, parseFloat(actualQuantity));
      alert('Production completed successfully! Finished goods have been added to inventory.');
      setShowDetailsModal(false);
      await fetchBatches();
    } catch (err) {
      console.error('Error completing production:', err);
      alert(err.response?.data?.detail || 'Failed to complete production');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBatch = async (batchId, batchNumber) => {
    if (!window.confirm(`Delete production batch ${batchNumber}? This can only be done for planned batches.`)) {
      return;
    }

    try {
      await productionAPI.delete(batchId);
      alert('Production batch deleted successfully');
      await fetchBatches();
    } catch (err) {
      console.error('Error deleting batch:', err);
      alert(err.response?.data?.detail || 'Failed to delete production batch');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      planned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      planned: '📋',
      in_progress: '⚙️',
      completed: '✅',
    };
    return icons[status] || '❓';
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading production batches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-red-200 bg-red-50 p-6">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="card-title">Production Batches</h2>
            <span className="text-sm text-gray-500">{batches.length} total</span>
          </div>
        </div>

        {batches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No production batches found</p>
            <p className="text-sm text-gray-400">Create a production batch to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Planned Qty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actual Qty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Production Line
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{batch.batch_number}</div>
                      {batch.supervisor && (
                        <div className="text-xs text-gray-500">Supervisor: {batch.supervisor}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">BOM #{batch.bom_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{batch.planned_quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {batch.actual_quantity || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(batch.status)}`}>
                        {getStatusIcon(batch.status)} {batch.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {batch.production_line || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => fetchBatchDetails(batch.id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View Details
                      </button>
                      {batch.status === 'planned' && (
                        <>
                          <button
                            onClick={() => handleStartProduction(batch.id)}
                            disabled={actionLoading}
                            className="text-emerald-600 hover:text-emerald-900 mr-3"
                          >
                            Start
                          </button>
                          <button
                            onClick={() => handleDeleteBatch(batch.id, batch.batch_number)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && batchDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Production Batch Details</h2>
                <p className="text-sm text-gray-500 mt-1">{batchDetails.batch.batch_number}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Batch Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Product</p>
                  <p className="font-medium">{batchDetails.bom.product_name}</p>
                  <p className="text-sm text-gray-500">{batchDetails.bom.product_code}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">BOM</p>
                  <p className="font-medium">{batchDetails.bom.bom_number} v{batchDetails.bom.version}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(batchDetails.batch.status)}`}>
                    {getStatusIcon(batchDetails.batch.status)} {batchDetails.batch.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Planned Quantity</p>
                  <p className="font-medium">{batchDetails.batch.planned_quantity}</p>
                </div>
                {batchDetails.batch.production_line && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Production Line</p>
                    <p className="font-medium">{batchDetails.batch.production_line}</p>
                  </div>
                )}
                {batchDetails.batch.supervisor && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Supervisor</p>
                    <p className="font-medium">{batchDetails.batch.supervisor}</p>
                  </div>
                )}
              </div>

              {/* Material Requirements */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                  Material Requirements
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Per Unit</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total Required</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Available</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {batchDetails.material_requirements.map((req, idx) => (
                        <tr key={idx} className={req.sufficient ? '' : 'bg-red-50'}>
                          <td className="px-4 py-2">
                            <div className="font-medium">{req.material_name}</div>
                            <div className="text-xs text-gray-500">{req.material_code}</div>
                          </td>
                          <td className="px-4 py-2 text-right">
                            {req.quantity_per_unit.toFixed(4)} {req.unit_of_measure}
                          </td>
                          <td className="px-4 py-2 text-right font-medium">
                            {req.total_required.toFixed(4)} {req.unit_of_measure}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {req.available_quantity.toFixed(4)} {req.unit_of_measure}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {req.sufficient ? (
                              <span className="text-green-600">✓</span>
                            ) : (
                              <span className="text-red-600">✗ Insufficient</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Complete Production (if in progress) */}
              {batchDetails.batch.status === 'in_progress' && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                    Complete Production
                  </h3>
                  <div className="flex items-end space-x-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Actual Quantity Produced
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={actualQuantity}
                        onChange={(e) => setActualQuantity(e.target.value)}
                        className="input-field"
                        min="0.01"
                      />
                    </div>
                    <button
                      onClick={handleCompleteProduction}
                      disabled={actionLoading}
                      className="btn-primary"
                    >
                      {actionLoading ? 'Processing...' : 'Complete Production'}
                    </button>
                  </div>
                </div>
              )}

              {/* Notes */}
              {batchDetails.batch.notes && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm text-gray-700">{batchDetails.batch.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductionBatchList;
