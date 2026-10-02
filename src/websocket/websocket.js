// src/websocket/websocket.js

import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import { WS_URL } from "@/api/config";

// ============================================================
// GLOBAL CLIENT
// ============================================================

let stompClient = null;

// ============================================================
// SUBSCRIPTIONS
// ============================================================

let locationSubscription = null;

let alertSubscriptions = [];

// ============================================================
// CONNECTION GENERATION
// ============================================================
//
// Every new connection receives a new generation.
//
// Old connection:
//
// generation = 1
//
// Refresh:
//
// generation = 2
//
// Messages from generation 1 are ignored.
//
// ============================================================

let connectionGeneration = 0;

let isConnecting = false;

// ============================================================
// UNSUBSCRIBE
// ============================================================

const unsubscribeAll = () => {
  // ----------------------------------------------------------
  // LOCATION
  // ----------------------------------------------------------

  if (locationSubscription) {
    try {
      locationSubscription.unsubscribe();
    } catch (error) {
      console.warn("Could not unsubscribe location:", error);
    }

    locationSubscription = null;
  }

  // ----------------------------------------------------------
  // ALERTS
  // ----------------------------------------------------------

  alertSubscriptions.forEach((subscription) => {
    try {
      subscription.unsubscribe();
    } catch (error) {
      console.warn("Could not unsubscribe alert:", error);
    }
  });

  alertSubscriptions = [];
};

// ============================================================
// CONNECT
// ============================================================

export const connectWebSocket = (
  devicePublicId,
  onLocationReceived,
  onAlertReceived,
  onConnectionStateChanged,
) => {
  const validDevice =
    typeof devicePublicId === "string" && devicePublicId.trim().length > 0;

  if (!validDevice) {
    console.warn("⚠️ No valid device ID for WebSocket");

    return;
  }

  // ----------------------------------------------------------
  // New connection generation
  // ----------------------------------------------------------

  const currentGeneration = ++connectionGeneration;

  console.log("🔄 Creating WebSocket session:", currentGeneration);

  // ----------------------------------------------------------
  // Destroy old client
  // ----------------------------------------------------------

  if (stompClient) {
    unsubscribeAll();

    const oldClient = stompClient;

    stompClient = null;

    try {
      oldClient.deactivate();
    } catch (error) {
      console.warn("Old WebSocket deactivation:", error);
    }
  }

  isConnecting = true;

  // ==========================================================
  // CREATE STOMP CLIENT
  // ==========================================================

  const client = new Client({
    // ------------------------------------------------------
    // SockJS
    // ------------------------------------------------------

    webSocketFactory: () => {
      console.log("🌐 Creating SockJS:", WS_URL);

      return new SockJS(WS_URL);
    },

    // ------------------------------------------------------
    // Reconnect
    // ------------------------------------------------------

    reconnectDelay: 5000,

    // ------------------------------------------------------
    // Heartbeat
    // ------------------------------------------------------

    heartbeatIncoming: 10000,

    heartbeatOutgoing: 10000,

    // ------------------------------------------------------
    // Debug
    // ------------------------------------------------------

    debug: (message) => {
      console.log("[STOMP]", message);
    },

    // ======================================================
    // CONNECTED
    // ======================================================

    onConnect: () => {
      // ----------------------------------------------------
      // Ignore old connection
      // ----------------------------------------------------

      if (currentGeneration !== connectionGeneration) {
        console.warn("⚠️ Ignoring stale WebSocket connection");

        try {
          client.deactivate();
        } catch {
          // Ignore
        }

        return;
      }

      isConnecting = false;

      console.log("✅ WebSocket Connected");

      console.log("Session:", currentGeneration);

      if (onConnectionStateChanged) {
        onConnectionStateChanged("connected");
      }

      // ====================================================
      // LOCATION
      // ====================================================

      if (typeof onLocationReceived === "function") {
        const topic = `/topic/location/${devicePublicId}`;

        console.log("📍 Subscribing:", topic);

        locationSubscription = client.subscribe(
          topic,

          (message) => {
            // --------------------------------------------
            // Ignore stale session
            // --------------------------------------------

            if (currentGeneration !== connectionGeneration) {
              console.warn("⚠️ Ignoring stale location message");

              return;
            }

            // --------------------------------------------
            // Parse
            // --------------------------------------------

            let location;

            try {
              location = JSON.parse(message.body);
            } catch (error) {
              console.error("❌ Invalid location JSON:", error);

              return;
            }

            // --------------------------------------------
            // Validate
            // --------------------------------------------

            const latitude = Number(location?.latitude);

            const longitude = Number(location?.longitude);

            if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
              console.warn("⚠️ Invalid GPS coordinate:", location);

              return;
            }

            // --------------------------------------------
            // Normalize
            // --------------------------------------------

            const normalizedLocation = {
              ...location,

              latitude,

              longitude,
            };

            console.log("📍 GPS RECEIVED:", normalizedLocation);

            // --------------------------------------------
            // Send to LiveMap
            // --------------------------------------------

            onLocationReceived(normalizedLocation);
          },
        );
      }

      // ====================================================
      // ALERT
      // ====================================================

      if (typeof onAlertReceived === "function") {
        const topic = `/topic/alerts/${devicePublicId}`;

        console.log("🚨 Subscribing:", topic);

        const subscription = client.subscribe(
          topic,

          (message) => {
            if (currentGeneration !== connectionGeneration) {
              return;
            }

            let alert;

            try {
              alert = JSON.parse(message.body);
            } catch (error) {
              console.error("❌ Invalid alert JSON:", error);

              return;
            }

            console.log("🚨 ALERT:", alert);

            onAlertReceived(alert);
          },
        );

        alertSubscriptions.push(subscription);
      }
    },

    // ======================================================
    // STOMP ERROR
    // ======================================================

    onStompError: (frame) => {
      if (currentGeneration !== connectionGeneration) {
        return;
      }

      console.error("❌ STOMP ERROR:", frame);

      if (onConnectionStateChanged) {
        onConnectionStateChanged("error");
      }
    },

    // ======================================================
    // SOCKET ERROR
    // ======================================================

    onWebSocketError: (error) => {
      if (currentGeneration !== connectionGeneration) {
        return;
      }

      console.error("❌ WEBSOCKET ERROR:", error);

      if (onConnectionStateChanged) {
        onConnectionStateChanged("error");
      }
    },

    // ======================================================
    // SOCKET CLOSE
    // ======================================================

    onWebSocketClose: (event) => {
      if (currentGeneration !== connectionGeneration) {
        return;
      }

      console.warn("🔌 WebSocket closed:", event);

      isConnecting = false;

      if (onConnectionStateChanged) {
        onConnectionStateChanged("disconnected");
      }
    },

    // ======================================================
    // DISCONNECT
    // ======================================================

    onDisconnect: () => {
      if (currentGeneration !== connectionGeneration) {
        return;
      }

      console.log("🔌 STOMP disconnected");

      isConnecting = false;

      if (onConnectionStateChanged) {
        onConnectionStateChanged("disconnected");
      }
    },
  });

  // ----------------------------------------------------------
  // Store client
  // ----------------------------------------------------------

  stompClient = client;

  // ----------------------------------------------------------
  // Activate
  // ----------------------------------------------------------

  client.activate();
};

// ============================================================
// RESET TRACKING SESSION
// ============================================================
//
// IMPORTANT:
//
// This does NOT delete backend history.
//
// It only destroys the current frontend WebSocket session.
//
// LiveMap will clear trackPoints separately.
//
// ============================================================

export const resetWebSocketSession = async () => {
  console.log("🧹 RESETTING WEBSOCKET SESSION");

  // Invalidate all old messages
  connectionGeneration += 1;

  unsubscribeAll();

  if (!stompClient) {
    isConnecting = false;

    return;
  }

  const client = stompClient;

  stompClient = null;

  try {
    await client.deactivate();

    console.log("✅ WebSocket session reset");
  } catch (error) {
    console.error("❌ WebSocket reset error:", error);
  }

  isConnecting = false;
};

// ============================================================
// DISCONNECT
// ============================================================

export const disconnectWebSocket = async () => {
  console.log("🔌 Disconnecting WebSocket");

  // Invalidate old callbacks
  connectionGeneration += 1;

  unsubscribeAll();

  if (!stompClient) {
    isConnecting = false;

    return;
  }

  const client = stompClient;

  stompClient = null;

  try {
    await client.deactivate();

    console.log("✅ WebSocket disconnected");
  } catch (error) {
    console.error("❌ WebSocket disconnect error:", error);
  }

  isConnecting = false;
};

// ============================================================
// STATUS
// ============================================================

export const isWebSocketConnected = () => {
  return stompClient !== null && stompClient.connected === true;
};

export const isWebSocketConnecting = () => {
  return isConnecting;
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  connectWebSocket,
  disconnectWebSocket,
  resetWebSocketSession,
  isWebSocketConnected,
  isWebSocketConnecting,
};
