import axiosClient from "./axiosClient";

export const getAllProducts = (page = 0, size = 10, name = "", categoryId = null, unitId = null, sortName = "asc", filterActive = "all") => {
  const params = new URLSearchParams({ page, size, sortName, filterActive });
  if (name) params.append("name", name);
  if (categoryId) params.append("categoryId", categoryId);
  if (unitId) params.append("unitId", unitId);
  return axiosClient.get(`/products?${params}`).then(r => r.data);
};

export const getActiveProducts = (page = 0, size = 20) =>
  axiosClient.get(`/products/active?page=${page}&size=${size}`).then(r => r.data);

export const getProductById = (id) =>
  axiosClient.get(`/products/${id}`).then(r => r.data);

export const createProduct = (data) =>
  axiosClient.post(`/products`, data).then(r => r.data);

export const updateProduct = (id, data) =>
  axiosClient.put(`/products/${id}`, data).then(r => r.data);

export const deactivateProduct = (id) =>
  axiosClient.delete(`/products/${id}`).then(r => r.data);