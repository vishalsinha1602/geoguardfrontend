export const logout = () => {

    localStorage.removeItem("accessToken");

    window.location.href = "/login";

};

export const isAuthenticated = () => {

    return !!localStorage.getItem("accessToken");

};

export const getToken = () => {

    return localStorage.getItem("accessToken");

};