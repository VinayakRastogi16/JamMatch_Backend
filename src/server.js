import {app} from "./app.js";
import http from "http";
import { Server } from "socket.io";
import { Message } from "./models/messages.model.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ── CHAT join (no limit) ──
  socket.on("join-chat", (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined chat room: ${roomId}`);
  });

  // ── CHAT message ──
  socket.on("send-message", async ({ roomId, senderId, text }) => {
    try {
      const message = new Message({ roomId, senderId, text });
      await message.save();

      io.to(roomId).emit("receive-message", {
        _id: message._id,
        senderId,
        text,
        createdAt: message.createdAt,
      });
    } catch (e) {
      console.error("Message save error:", e);
    }
  });

  // ── JAM join (max 2) ──
  socket.on("join-room", async (roomId) => {
    const clients = io.sockets.adapter.rooms.get(roomId);
    const numClients = clients ? clients.size : 0;

    if (numClients >= 2) {
      socket.emit("room-full");
      return;
    }

    socket.join(roomId);

    if (numClients === 0) {
      socket.emit("role", "receiver");
    } else if (numClients === 1) {
      socket.emit("role", "caller");
      socket.to(roomId).emit("caller-joined");
    }
  });

  // ── JAM WebRTC signaling ──
  socket.on("offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("answer", answer);
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("ice-candidate", candidate);
  });
});

server.listen(8080, () => {
  console.log("server running at port 8080");
});