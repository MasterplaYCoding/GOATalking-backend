import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";
import { Message } from "./models/chatModel";

let wss: WebSocketServer;
const clients = new Set<WebSocket>();

export const initWebSocket = (server: Server) => {
  wss = new WebSocketServer({ server });

  wss.on("connection", async (ws) => {
    clients.add(ws);
    console.log("Client connected to chat WebSocket");

    try {
      const messages = await Message.find().sort({ timestamp: -1 }).limit(50);
      ws.send(JSON.stringify({ type: "INITIAL_MESSAGES", data: messages.reverse() }));
    } catch (error) {
      console.error("Error fetching initial messages:", error);
    }

    ws.on("message", async (data) => {
      try {
        const parsedData = JSON.parse(data.toString());

        if (parsedData.type === "SEND_MESSAGE") {
          const newMessage = new Message({
            userId: parsedData.payload.userId,
            username: parsedData.payload.username,
            text: parsedData.payload.text
          });
          
          await newMessage.save();

          // Broadcast the saved message to all connected clients
          broadcast({ type: "RECEIVE_MESSAGE", data: newMessage });
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => clients.delete(ws));
  });
};

export const broadcast = (data: any) => {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

//matei_user dbUserPassword