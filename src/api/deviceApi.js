import axiosInstance from "./axiosConfig";

export const getDevices = () => {
    return axiosInstance.get("/users/devices");
};

export const getDeviceById = (publicId) => {
    return axiosInstance.get(`/users/devices/${publicId}`);
};

export const createDevice = (device) => {
    return axiosInstance.post("/users/devices", device);
};

export const updateDevice = (publicId, updateData) => {
    return axiosInstance.patch(
        `/users/devices/${publicId}`,
        updateData
    );
};

export const deleteDevice = (publicId) => {
    return axiosInstance.delete(`/users/devices/${publicId}`);
};