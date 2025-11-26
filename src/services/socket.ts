import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Initialize socket (idempotent).
 * @param userId - current logged in user's id (optional)
 * @param token - auth token (optional)
 */
export const initSocket = (userId?: string, token?: string) => {
  if (socket?.connected) {
    console.log("[socket] Using existing connection");
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const query: Record<string, string> = {};
  if (userId) query.userId = userId;
  if (token) query.token = token;

  const apiUrl = "http://localhost:5000";

  console.log("[socket] Connecting to:", apiUrl);
  console.log("[socket] User ID:", userId);

  socket = io(apiUrl, {
    query,
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("[socket] ✅ Connected successfully", socket?.id);
  });

  socket.on("connect_error", (err: any) => {
    console.error("[socket] ❌ Connection error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("[socket] 🔌 Disconnected:", reason);
  });

  socket.on("error", (err: any) => {
    console.error("[socket] 💥 Error:", err);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    console.log("[socket] 🛑 Manually disconnecting");
    socket.disconnect();
    socket = null;
  }
};

export const isSocketConnected = () => {
  return socket?.connected ?? false;
};