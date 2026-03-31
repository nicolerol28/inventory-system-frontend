import axiosClient from "./axiosClient";

export const getWarehouses = (page = 0, size = 20, name = "", filterActive = "all") =>
  axiosClient.get(`/warehouses`, {
    params: { page, size, name: name || undefined, filterActive }
  }).then(r => r.data);

export const getActiveWarehouses = () =>
  axiosClient.get(`/warehouses/active`).then(r => r.data);

export const getWarehouseById = (id) =>
  axiosClient.get(`/warehouses/${id}`).then(r => r.data);

export const createWarehouse = (data) =>
  axiosClient.post(`/warehouses`, data).then(r => r.data);

export const updateWarehouse = (id, data) =>
  axiosClient.put(`/warehouses/${id}`, data).then(r => r.data);

export const deactivateWarehouse = (id) =>
  axiosClient.delete(`/warehouses/${id}`).then(r => r.data);