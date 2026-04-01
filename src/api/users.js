import axiosClient from "./axiosClient";

export const getUsers = (page = 0, size = 20, name = "", filterActive = "all", sortName = "asc") =>
  axiosClient.get(`/users`, {
    params: { page, size, name: name || undefined, filterActive, sortName }
  }).then(r => r.data);

export const getActiveUsers = () =>
  axiosClient.get(`/users/active`).then(r => r.data);

export const createUser = (data) =>
  axiosClient.post(`/auth/register`, data).then(r => r.data);

export const updateUser = (id, data) =>
  axiosClient.put(`/users/${id}`, data).then(r => r.data);

export const deactivateUser = (id) =>
  axiosClient.delete(`/users/${id}`).then(r => r.data);