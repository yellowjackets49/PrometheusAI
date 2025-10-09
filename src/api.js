import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Raw Materials API
export const rawMaterialsAPI = {
  getAll: () => api.get('/raw-materials/'),
  getById: (id) => api.get(`/raw-materials/${id}`),
  create: (data) => api.post('/raw-materials/', data),
  update: (id, data) => api.put(`/raw-materials/${id}`, data),
  delete: (id) => api.delete(`/raw-materials/${id}`),
  getInventoryStatus: () => api.get('/raw-materials/inventory/status'),
};

// Suppliers API
export const suppliersAPI = {
  getAll: () => api.get('/suppliers/'),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers/', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
  toggleActive: (id) => api.patch(`/suppliers/${id}/toggle-active`),
};

// Purchase Orders API
export const purchaseOrdersAPI = {
  getAll: () => api.get('/purchase-orders/'),
  getById: (id) => api.get(`/purchase-orders/${id}`),
  getDetails: (id) => api.get(`/purchase-orders/${id}/details`),
  create: (data) => api.post('/purchase-orders/', data),
  delete: (id) => api.delete(`/purchase-orders/${id}`),
  updateStatus: (id, status) => api.patch(`/purchase-orders/${id}/status`, null, { params: { status } }),
};

// Goods Receipt API
export const goodsReceiptAPI = {
  receivePO: (poId) => api.post(`/goods-receipt/receive-po/${poId}`),
};

// Inventory API
export const inventoryAPI = {
  getSummary: () => api.get('/inventory/summary'),
  getByLocation: () => api.get('/inventory/by-location'),
  getDetails: (materialId) => api.get(`/inventory/details/${materialId}`),
  adjust: (data) => api.post('/inventory/adjust', null, { params: data }),
  transfer: (data) => api.post('/inventory/transfer', null, { params: data }),
  getLowStock: () => api.get('/inventory/low-stock'),
  getValuation: () => api.get('/inventory/valuation'),
};

// BOM API
export const bomAPI = {
  getAll: () => api.get('/bom/'),
  getById: (id) => api.get(`/bom/${id}`),
  getDetails: (id) => api.get(`/bom/${id}/details`),
  getByProductCode: (productCode) => api.get(`/bom/product/${productCode}`),
  create: (data) => api.post('/bom/', data),
  delete: (id) => api.delete(`/bom/${id}`),
  updateStatus: (id, status) => api.patch(`/bom/${id}/status`, null, { params: { status } }),
  getCostAnalysis: () => api.get('/bom/cost-analysis/summary'),
};

// Production API
export const productionAPI = {
  getAll: () => api.get('/production/'),
  getById: (id) => api.get(`/production/${id}`),
  getDetails: (id) => api.get(`/production/${id}/details`),
  create: (data) => api.post('/production/', data),
  delete: (id) => api.delete(`/production/${id}`),
  start: (id) => api.post(`/production/${id}/start`),
  complete: (id, actualQuantity) => api.post(`/production/${id}/complete`, null, { params: { actual_quantity: actualQuantity } }),
  getSummary: () => api.get('/production/status/summary'),
};

// Finished Goods API
export const finishedGoodsAPI = {
  getAll: () => api.get('/finished-goods/'),
  getById: (id) => api.get(`/finished-goods/${id}`),
  getSummary: () => api.get('/finished-goods/summary/by-product'),
  getByProductCode: (productCode) => api.get(`/finished-goods/product/${productCode}`),
  create: (data) => api.post('/finished-goods/', data),
  delete: (id) => api.delete(`/finished-goods/${id}`),
  updateStatus: (id, status) => api.patch(`/finished-goods/${id}/status`, null, { params: { status } }),
  adjustQuantity: (id, newQuantity, reason) => api.patch(`/finished-goods/${id}/adjust`, null, { params: { new_quantity: newQuantity, reason } }),
  getStatistics: () => api.get('/finished-goods/statistics/overview'),
};

// Sales API
export const salesAPI = {
  getAll: () => api.get('/sales/'),
  getById: (id) => api.get(`/sales/${id}`),
  getDetails: (id) => api.get(`/sales/${id}/details`),
  create: (data) => api.post('/sales/', data),
  delete: (id) => api.delete(`/sales/${id}`),
  updateStatus: (id, status) => api.patch(`/sales/${id}/status`, null, { params: { status } }),
  fulfill: (id) => api.post(`/sales/${id}/fulfill`),
  recordPayment: (id, amount, paymentMethod, paymentReference) =>
    api.post(`/sales/${id}/payment`, null, {
      params: {
        amount,
        payment_method: paymentMethod,
        payment_reference: paymentReference
      }
    }),
  getSummary: () => api.get('/sales/statistics/summary'),
};

export default api;