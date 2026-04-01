import axiosClient from "./axiosClient";

export const getActiveCategories = () =>
  axiosClient.get(`/categories/active`).then(r => r.data);

export const getCategories = (page = 0, size = 20, name = "", filterActive = "all", sortName = "asc") =>
  axiosClient.get(`/categories`, {
    params: { page, size, name: name || undefined, filterActive, sortName }
  }).then(r => r.data);

export const createCategory = (data) =>
  axiosClient.post(`/categories`, data).then(r => r.data);

export const updateCategory = (id, data) =>
  axiosClient.put(`/categories/${id}`, data).then(r => r.data);

export const deactivateCategory = (id) =>
  axiosClient.delete(`/categories/${id}`).then(r => r.data);