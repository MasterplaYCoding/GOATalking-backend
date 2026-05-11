import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";
import { Message } from "./models/chatModel";
import { prisma } from "./db";

let wss: WebSocketServer;
const clients = new Set<WebSocket>();

const chatSpamTracker = new Map<string, number[]>();

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
          const userId = parsedData.payload.userId;
          const now = Date.now();

          let userTimestamps = chatSpamTracker.get(userId) || [];
          userTimestamps = userTimestamps.filter(t => now - t < 10000);
          userTimestamps.push(now);
          chatSpamTracker.set(userId, userTimestamps);

          if (userTimestamps.length > 4) {
            const newReason = "Chat Spamming (>4 msgs/10s)";
            const existingRecord = await prisma.observationList.findUnique({ where: { userId } });
            
            let finalReason = newReason;
            if (existingRecord) {
              finalReason = existingRecord.reason.includes(newReason) 
                ? existingRecord.reason 
                : `${existingRecord.reason} | ${newReason}`;
            }

            await prisma.observationList.upsert({
              where: { userId },
              update: { reason: finalReason, detectedAt: new Date() },
              create: { userId, reason: finalReason }
            });
            console.log(`SUSPICIOUS BEHAVIOR DETECTED: User ${userId} flagged for Chat Spamming.`);
          }

          const newMessage = new Message({
            userId: userId,
            username: parsedData.payload.username,
            text: parsedData.payload.text
          });
          
          await newMessage.save();

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