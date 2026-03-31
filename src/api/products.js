import axiosClient from "./axiosClient";

export const getProducts = (page = 0, size = 1) =>
  axiosClient.get(`/products?page=${page}&size=${size}`).then(r => r.data);