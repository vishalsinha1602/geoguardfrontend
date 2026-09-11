import phoneBrowserTrackerApi from "./phoneBrowserTrackerApi";

export const saveBrowserLocation = (location) => {
  return phoneBrowserTrackerApi.post("/devices/locations/browser", location);
};
