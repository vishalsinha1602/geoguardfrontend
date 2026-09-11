import axiosInstance from "./axiosConfig";

export const getLatestLocation = (devicePublicId) => {
  return axiosInstance.get(`/devices/locations/latest/${devicePublicId}`);
};

export const getLocationHistory = (devicePublicId) => {
  return axiosInstance.get(`/devices/locations/history/${devicePublicId}`);
};
