import axiosClient from "./axiosClient";

export const getSuppliers = (page = 0, size = 1) =>
  axiosClient.get(`/suppliers?page=${page}&size=${size}`).then(r => r.data);

export const getActiveSuppliers = () =>
  axiosClient.get(`/suppliers/active`).then(r => r.data);