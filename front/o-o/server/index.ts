import http from "http";
import express from "express";
import { WebSocketServer } from "ws";
import { setupWSConnection } from "y-websocket/bin/utils.js";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => setupWSConnection(ws, req));

const PORT = 8080;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ y-websocket dev server running on ws://localhost:${PORT}`);
});
