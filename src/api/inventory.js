import axiosClient from "./axiosClient";

export const getStockByWarehouse = (warehouseId, page = 0, size = 5, productName = "", sortOrder = "asc") => {
  const params = new URLSearchParams({ page, size, sortOrder });
  if (productName) params.append("productName", productName);
  return axiosClient.get(`/inventory/stock/warehouse/${warehouseId}?${params}`).then(r => r.data);
};

export const getStock = (productId, warehouseId) =>
  axiosClient.get(`/inventory/stock?productId=${productId}&warehouseId=${warehouseId}`).then(r => r.data);

export const getMovementsByWarehouse = (warehouseId, page = 0, size = 20, movementType = "") =>
  axiosClient.get(`/inventory/movements/warehouse/${warehouseId}`, {
    params: { page, size, movementType: movementType || undefined },
  }).then(r => r.data);

export const getMovementsByDateRange = (warehouseId, from, to, page = 0, size = 20) =>
  axiosClient.get(`/inventory/movements/warehouse/${warehouseId}/date-range?from=${from}&to=${to}&page=${page}&size=${size}`).then(r => r.data);

export const registerMovement = (data) =>
  axiosClient.post(`/inventory/movements`, data).then(r => r.data);

export const updateMinQuantity = (stockId, minQuantity) =>
  axiosClient.patch(`/inventory/stock/${stockId}/min-quantity`, { minQuantity }).then(r => r.data);