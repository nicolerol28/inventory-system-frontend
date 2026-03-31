import axiosClient from "./axiosClient";

export const getWarehouses = (page = 0, size = 1) =>
  axiosClient.get(`/warehouses?page=${page}&size=${size}`).then(r => r.data);

export const getActiveWarehouses = () =>
  axiosClient.get(`/warehouses/active`).then(r => r.data);