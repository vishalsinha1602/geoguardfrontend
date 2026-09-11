import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { WS_URL } from "@/api/config";

let stompClient = null;

export const connectWebSocket = (
  devicePublicId,
  onLocationReceived,
  onAlertReceived,
) => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }

  stompClient = new Client({
    webSocketFactory: () => new SockJS(WS_URL),

    reconnectDelay: 5000,

    debug: (msg) => console.log(msg),

    onConnect: () => {
      console.log("✅ WebSocket Connected");

      // ==========================================
      // LOCATION (LiveMap)
      // ==========================================

      if (devicePublicId && onLocationReceived) {
        const locationTopic = `/topic/location/${devicePublicId}`;

        console.log("Subscribed:", locationTopic);

        stompClient.subscribe(
          locationTopic,

          (message) => {
            const location = JSON.parse(message.body);

            console.log("📍 LOCATION RECEIVED");
            console.log(location);

            onLocationReceived(location);
          },
        );
      }

      // ==========================================
      // ALERT (LiveMap - Device Specific)
      // ==========================================

      if (devicePublicId && onAlertReceived) {
        const alertTopic = `/topic/alerts/${devicePublicId}`;

        console.log("Subscribed:", alertTopic);

        stompClient.subscribe(
          alertTopic,

          (message) => {
            const alert = JSON.parse(message.body);

            console.log("🚨 DEVICE ALERT");
            console.log(alert);

            onAlertReceived(alert);
          },
        );
      }

      // ==========================================
      // FUTURE USE
      // Dashboard -> All Device Alerts
      // Backend Topic : /topic/alerts
      // ==========================================

      /*
            if (onAlertReceived) {

                console.log("Subscribed: /topic/alerts");

                stompClient.subscribe(

                    "/topic/alerts",

                    (message) => {

                        const alert =
                            JSON.parse(message.body);

                        console.log("🚨 DASHBOARD ALERT");
                        console.log(alert);

                        onAlertReceived(alert);

                    }

                );

            }
            */
    },

    onStompError: (frame) => {
      console.error("❌ STOMP ERROR");
      console.error(frame);
    },

    onWebSocketError: (error) => {
      console.error("❌ WEBSOCKET ERROR");
      console.error(error);
    },
  });

  stompClient.activate();
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();

    stompClient = null;
  }
};
