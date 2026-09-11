import axiosInstance from "./axiosConfig";

export const createGeofence = (data) => {
    return axiosInstance.post("/geofences", data);
};

export const getDeviceGeofences = (devicePublicId) => {
    return axiosInstance.get(
        `/geofences/device/${devicePublicId}`
    );
};

export const deleteGeofence = (id) => {
    return axiosInstance.delete(`/geofences/${id}`);
};