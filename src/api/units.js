import axiosClient from "./axiosClient";

export const getActiveUnits = () =>
  axiosClient.get(`/units/active`).then(r => r.data);

export const getUnits = (page = 0, size = 20, name = "", filterActive = "all", sortName = "asc") =>
  axiosClient.get(`/units`, {
    params: { page, size, name: name || undefined, filterActive, sortName }
  }).then(r => r.data);

export const createUnit = (data) =>
  axiosClient.post(`/units`, data).then(r => r.data);

export const updateUnit = (id, data) =>
  axiosClient.put(`/units/${id}`, data).then(r => r.data);

export const deactivateUnit = (id) =>
  axiosClient.delete(`/units/${id}`).then(r => r.data);