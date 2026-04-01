import axiosClient from "./axiosClient";

export const getSuppliers = (page = 0, size = 20, name = "", filterActive = "all", sortName = "asc") =>
  axiosClient.get(`/suppliers`, {
    params: { page, size, name: name || undefined, filterActive, sortName }
  }).then(r => r.data);

export const getActiveSuppliers = () =>
  axiosClient.get(`/suppliers/active`).then(r => r.data);

export const getSupplierById = (id) =>
  axiosClient.get(`/suppliers/${id}`).then(r => r.data);

export const createSupplier = (data) =>
  axiosClient.post(`/suppliers`, data).then(r => r.data);

export const updateSupplier = (id, data) =>
  axiosClient.put(`/suppliers/${id}`, data).then(r => r.data);

export const deactivateSupplier = (id) =>
  axiosClient.delete(`/suppliers/${id}`).then(r => r.data);