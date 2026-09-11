import axiosInstance from "./axiosConfig";

export const getAlerts = (devicePublicId) => {
  return axiosInstance.get(`/alerts/device/${devicePublicId}`);
};

export const clearAlerts = (devicePublicId) => {
  return axiosInstance.delete(`/alerts/device/${devicePublicId}`);
};
