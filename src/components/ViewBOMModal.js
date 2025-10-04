import React from 'react';

function ViewBOMModal({ bomData, onClose, onRefresh }) {
  const { bom, line_items, total_material_cost, cost_per_unit } = bomData;

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-emerald-100 text-emerald-700',
      draft: 'bg-gray-100 text-gray-700',
      obsolete: 'bg-red-100 text-red-700',
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-semibold text-gray-900">Bill of Materials</h2>
              <span className={`badge ${getStatusBadge(bom.status)}`}>
                {bom.status}
              </span>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                v{bom.version}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{bom.bom_number}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Product Info and Cost Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Information */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Product Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Product Name</p>
                  <p className="font-medium text-gray-900">{bom.product_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Product Code</p>
                  <p className="font-medium text-gray-900">{bom.product_code}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Base Quantity</p>
                  <p className="font-medium text-gray-900">
                    {bom.base_quantity} {bom.unit_of_measure}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="font-medium text-gray-900">
                    {new Date(bom.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Cost Summary */}
            <div className="card p-5 bg-emerald-50 border border-emerald-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Cost Summary
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Material Cost</p>
                  <p className="text-3xl font-bold text-emerald-700">
                    ${total_material_cost.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    For {bom.base_quantity} {bom.unit_of_measure}
                  </p>
                </div>
                <div className="pt-3 border-t border-emerald-300">
                  <p className="text-sm text-gray-600 mb-1">Cost Per Unit</p>
                  <p className="text-2xl font-bold text-emerald-800">
                    ${cost_per_unit.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Per {bom.unit_of_measure}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Materials Required */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Materials Required ({line_items.length} items)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      #
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Material
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Qty Required
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Scrap %
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Actual Qty
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Unit Cost
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Line Cost
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {line_items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {item.sequence_number || '-'}
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.material_name}</p>
                          <p className="text-xs text-gray-500">{item.material_code}</p>
                          {item.notes && (
                            <p className="text-xs text-gray-400 mt-1 italic">{item.notes}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <p className="text-sm text-gray-900">
                          {item.quantity_required.toFixed(4)} <span className="text-gray-500">{item.unit_of_measure}</span>
                        </p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <p className="text-sm text-gray-900">
                          {item.scrap_percentage.toFixed(1)}%
                        </p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {item.actual_quantity_needed.toFixed(4)} <span className="text-gray-500">{item.unit_of_measure}</span>
                        </p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <p className="text-sm text-gray-900">
                          ${item.standard_cost.toFixed(2)}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <p className="text-sm font-medium text-emerald-600">
                          ${item.line_cost.toFixed(2)}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="6" className="px-5 py-4 text-right text-sm font-semibold text-gray-900">
                      Total Material Cost:
                    </td>
                    <td className="px-5 py-4 text-right text-lg font-bold text-emerald-600">
                      ${total_material_cost.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
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

export default ViewBOMModal;