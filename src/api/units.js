import axiosClient from "./axiosClient";

export const getActiveUnits = () =>
  axiosClient.get(`/units/active`).then(r => r.data);