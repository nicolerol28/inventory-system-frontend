import axiosClient from "./axiosClient";

export async function loginRequest(email, password) {
  const response = await axiosClient.post("/auth/login", { email, password });
  return response.data;
}

export async function googleLoginRequest(idToken) {
  const response = await axiosClient.post("/auth/google", { idToken });
  return response.data;
}