import React from 'react';

function InventoryDetailsModal({ materialData, onClose, onRefresh }) {
  const { material, total_quantity, inventory_records } = materialData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Inventory Details</h2>
            <p className="text-sm text-gray-500 mt-1">{material.material_code} - {material.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Material Summary */}
          <div className="card p-5 bg-emerald-50 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Stock</p>
                <p className="text-3xl font-bold text-emerald-700">
                  {total_quantity.toFixed(2)} <span className="text-lg">{material.unit_of_measure}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Minimum Level</p>
                <p className="text-lg font-semibold text-gray-900">
                  {material.minimum_stock_level > 0
                    ? `${material.minimum_stock_level} ${material.unit_of_measure}`
                    : 'Not set'}
                </p>
              </div>
            </div>
          </div>

          {/* Inventory by Location/Batch */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Stock by Location & Batch
            </h3>

            {inventory_records.length === 0 ? (
              <div className="card p-8 text-center">
                <span className="text-4xl mb-2 block">📦</span>
                <p className="text-gray-500">No inventory records found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {inventory_records.map((record) => (
                  <div key={record.id} className="card p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-gray-400">📍</span>
                          <span className="font-medium text-gray-900">
                            {record.storage_location || 'Unassigned'}
                          </span>
                          {record.batch_number && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className="text-sm text-gray-600">
                                Batch: {record.batch_number}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {record.expiry_date && (
                            <div className="flex items-center space-x-1">
                              <span>⏰</span>
                              <span>Expires: {new Date(record.expiry_date).toLocaleDateString()}</span>
                            </div>
                          )}
                          {record.last_updated && (
                            <div className="flex items-center space-x-1">
                              <span>🔄</span>
                              <span>Updated: {new Date(record.last_updated).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600">
                          {record.quantity.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">{material.unit_of_measure}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default InventoryDetailsModal;