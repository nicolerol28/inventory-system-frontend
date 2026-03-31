import axiosClient from "./axiosClient";

export const getActiveCategories = () =>
  axiosClient.get(`/categories/active`).then(r => r.data);