import axiosInstance from "./axiosConfig";

export const login = (data) => {
  return axiosInstance.post("/auth/login", data);
};

export const signup = (data) => {
  return axiosInstance.post("/auth/signup", data);
};

export const logout = () => {
  return axiosInstance.post("/auth/logout");
};

export const refreshToken = () => {
  return axiosInstance.post("/auth/refresh");
};
