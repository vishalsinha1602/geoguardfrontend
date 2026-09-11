// import { useEffect, useRef, useState } from "react";
// import { saveLocation } from "../api/locationApi";
// // import { markDeviceOffline } from "../api/deviceApi";

// const BrowserTracker = ({ devicePublicId }) => {

//     const [batteryLevel, setBatteryLevel] = useState(100);
//     const batteryLevelRef = useRef(100);
//     const latestPosition = useRef(null);
//     const watchIdRef = useRef(null);
//     const intervalRef = useRef(null);
//     const permissionRef = useRef(null);

//     // -----------------------------
//     // Stop Tracking
//     // -----------------------------
//     const stopTracking = async () => {

//     console.log("Tracking Stopped");

//     if (watchIdRef.current !== null) {
//         navigator.geolocation.clearWatch(watchIdRef.current);
//         watchIdRef.current = null;
//     }

//     if (intervalRef.current !== null) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//     }

//     latestPosition.current = null;
//     };

//     // -----------------------------
//     // Start Tracking
//     // -----------------------------
//         const startTracking = () => {

//         if (!devicePublicId) return;

//         // Stop if internet is not available
//         if (!navigator.onLine) {

//             console.log("No Internet");

//             return;

//         }

//         // Prevent multiple trackers
//         if (
//             watchIdRef.current !== null ||
//             intervalRef.current !== null
//         ) {
//             return;
//         }

//         console.log("Tracking Started");

//         watchIdRef.current = navigator.geolocation.watchPosition(

//             (position) => {

//                 latestPosition.current = position;

//             },

//             async (error) => {

//                 console.log(error);

//                 if (
//                     error.code === error.PERMISSION_DENIED ||
//                     error.code === error.POSITION_UNAVAILABLE
//                 ) {

//                     await stopTracking();

//                 }

//             },

//             {
//                 enableHighAccuracy: true,
//                 maximumAge: 0,
//                 timeout: 10000
//             }

//         );

//         intervalRef.current = setInterval(async () => {

//             if (!latestPosition.current) return;

//             const location = {

//                 devicePublicId,

//                 latitude: latestPosition.current.coords.latitude,

//                 longitude: latestPosition.current.coords.longitude,

//                 // latitude:  28.544966246570617,
//                 // longitude: 77.15720027849376,

//                 speed: latestPosition.current.coords.speed ?? 0,

//                 batteryLevel: batteryLevelRef.current

//             };

//             console.log("Sending:", location);

//             try {

//                 await saveLocation(location);

//             }

//             catch (err) {

//                 console.log("Unable to send location", err);

//                 // Stop tracking if backend cannot be reached
//                 await stopTracking();

//             }

//         }, 5000);

//     };

//     // -----------------------------
//     // Battery
//     // -----------------------------
//     useEffect(() => {

//         let batteryManager = null;

//         const loadBattery = async () => {

//             if (!("getBattery" in navigator)) {

//                 console.log("Battery API not supported");

//                 batteryLevelRef.current = 100;

//                 setBatteryLevel(100);

//                 return;

//             }

//             try {

//                 batteryManager = await navigator.getBattery();

//                 const updateBattery = () => {

//                     const level = Math.round(
//                         batteryManager.level * 100
//                     );

//                     console.log("Battery:", level);

//                     batteryLevelRef.current = level;

//                     setBatteryLevel(level);

//                 };

//                 updateBattery();

//                 batteryManager.addEventListener(
//                     "levelchange",
//                     updateBattery
//                 );

//             }

//             catch (err) {

//                 console.log(err);

//                 batteryLevelRef.current = 100;

//                 setBatteryLevel(100);

//             }

//         };

//         loadBattery();

//         return ;

//     }, []);

//     // -----------------------------
// // Internet Connection
// // -----------------------------
//         useEffect(() => {

//             const handleOffline = async () => {

//                 console.log("Internet Disconnected");

//                 await stopTracking();

//             };

//             const handleOnline = () => {

//                 console.log("Internet Connected");

//                 startTracking();

//             };

//             window.addEventListener("offline", handleOffline);
//             window.addEventListener("online", handleOnline);

//             return () => {

//                 window.removeEventListener("offline", handleOffline);
//                 window.removeEventListener("online", handleOnline);

//             };

//         }, [devicePublicId]);

//     // -----------------------------
//     // Geolocation Permission
//     // -----------------------------
//     useEffect(() => {

//         if (!devicePublicId) return;

//         let mounted = true;

//         const init = async () => {

//             if (!navigator.permissions) {

//                 startTracking();

//                 return;

//             }

//             try {

//                 permissionRef.current =
//                     await navigator.permissions.query({
//                         name: "geolocation"
//                     });

//                 if (!mounted) return;

//                 console.log(
//                     "Permission:",
//                     permissionRef.current.state
//                 );

//                 if (
//                     permissionRef.current.state === "granted"
//                 ) {

//                     startTracking();

//                 }

//                 permissionRef.current.onchange =
//                     async () => {

//                         console.log(
//                             "Permission Changed:",
//                             permissionRef.current.state
//                         );

//                         if (
//                             permissionRef.current.state ===
//                             "granted"
//                         ) {

//                             startTracking();

//                         }

//                         else {

//                             await stopTracking();

//                         }

//                     };

//             }

//             catch (err) {

//                 console.log(err);

//             }

//         };

//         init();

//         return () => {

//             mounted = false;

//             if (permissionRef.current) {

//                 permissionRef.current.onchange = null;

//             }

//             stopTracking();

//         };

//     }, [devicePublicId]);

//     return null;

// };

// export default BrowserTracker;
