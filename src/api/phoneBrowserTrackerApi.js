import axios from "axios";
import { API_URL } from "./config";

const phoneBrowserTrackerApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

export default phoneBrowserTrackerApi;
