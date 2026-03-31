import axiosClient from "./axiosClient";

export const getStockByWarehouse = (warehouseId, page = 0, size = 5, productName = "", sortOrder = "asc") => {
  const params = new URLSearchParams({ page, size, sortOrder });
  if (productName) params.append("productName", productName);
  return axiosClient.get(`/inventory/stock/warehouse/${warehouseId}?${params}`).then(r => r.data);
};

export const getStock = (productId, warehouseId) =>
  axiosClient.get(`/inventory/stock?productId=${productId}&warehouseId=${warehouseId}`).then(r => r.data);