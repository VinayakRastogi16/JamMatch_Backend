import { app } from "./app.js";
import http from "http";
import { Server } from "socket.io";

import { Message } from "./models/messages.model.js";
import { User } from "./models/user.model.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ----------------------------------------
  // USER ONLINE
  // ----------------------------------------
  socket.on("user-online", async (userId) => {
    try {
      if (!userId) {
        console.error("user-online: userId is missing");
        return;
      }

      console.log("Before:", socket.userId);

      socket.userId = userId;

      console.log("After:", socket.userId);
      console.log("Socket ID:", socket.id);

      await User.findByIdAndUpdate(userId, {
        isOnline: true,
      });

      io.emit("user-status", {
        userId,
        isOnline: true,
      });
    } catch (err) {
      console.error("Error setting user online:", err);
    }
  });

  // ----------------------------------------
  // JOIN CHAT ROOM
  // ----------------------------------------
  socket.on("join-chat", async (roomId) => {
    try {
      if (!roomId) {
        console.error("join-chat: roomId is missing");
        return;
      }

      socket.join(roomId);

      console.log(`${socket.id} joined chat room ${roomId}`);
    } catch (err) {
      console.error("Error joining chat:", err);
    }
  });

  // ----------------------------------------
  // TYPING
  // ----------------------------------------
  socket.on("typing", ({ roomId, userId }) => {
    if (!roomId || !userId) return;

    socket.to(roomId).emit("typing", {
      userId,
    });
  });

  // ----------------------------------------
  // STOP TYPING
  // ----------------------------------------
  socket.on("stop-typing", ({ roomId, userId }) => {
    if (!roomId || !userId) return;

    socket.to(roomId).emit("stop-typing", {
      userId,
    });
  });

  // ----------------------------------------
  // MESSAGE READ
  // ----------------------------------------
  socket.on("message-read", async (data) => {
    try {
      if (!data) return;

      const { roomId, userId } = data;

      if (!roomId || !userId) return;

      await Message.updateMany(
        {
          roomId,
          senderId: { $ne: userId },
          read: false,
        },
        {
          read: true,
        }
      );

      socket.to(roomId).emit("message-read", {
        userId,
      });
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  });

  // ----------------------------------------
  // SEND MESSAGE
  // ----------------------------------------
  socket.on("send-message", async ({ roomId, text }) => {
    console.log("socket.id:", socket.id);
    console.log("socket.userId:", socket.userId);
    console.log("roomId:", roomId);
    console.log("text:", text);

    try {
      // IMPORTANT:
      // Do not allow a message without an authenticated/initialized user.
      if (!socket.userId) {
        console.error(
          "Cannot send message: socket.userId is missing."
        );

        socket.emit("message-error", {
          message: "User is not authenticated.",
        });

        return;
      }

      if (!roomId) {
        socket.emit("message-error", {
          message: "Room ID is required.",
        });

        return;
      }

      if (!text || !text.trim()) {
        socket.emit("message-error", {
          message: "Message cannot be empty.",
        });

        return;
      }

      const message = new Message({
        roomId,
        senderId: socket.userId,
        text: text.trim(),
      });

      await message.save();

      console.log("Message saved:", message);

      io.to(roomId).emit("receive-message", message);
    } catch (err) {
      console.error("Error sending message:", err);

      socket.emit("message-error", {
        message: "Failed to send message.",
      });
    }
  });

  // ----------------------------------------
  // WEBRTC ROOM
  // ----------------------------------------
  socket.on("join-room", async (roomId) => {
    try {
      if (!roomId) {
        console.error("join-room: roomId is missing");
        return;
      }

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
    } catch (err) {
      console.error("Error joining WebRTC room:", err);
    }
  });

  // ----------------------------------------
  // WEBRTC OFFER
  // ----------------------------------------
  socket.on("offer", ({ roomId, offer }) => {
    if (!roomId || !offer) return;

    socket.to(roomId).emit("offer", offer);
  });

  // ----------------------------------------
  // WEBRTC ANSWER
  // ----------------------------------------
  socket.on("answer", ({ roomId, answer }) => {
    if (!roomId || !answer) return;

    socket.to(roomId).emit("answer", answer);
  });

  // ----------------------------------------
  // ICE CANDIDATE
  // ----------------------------------------
  socket.on("ice-candidate", ({ roomId, candidate }) => {
    if (!roomId || !candidate) return;

    socket.to(roomId).emit("ice-candidate", candidate);
  });

  // ----------------------------------------
  // DISCONNECT
  // ----------------------------------------
  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);

    try {
      if (socket.userId) {
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date(),
        });

        io.emit("user-status", {
          userId: socket.userId,
          isOnline: false,
          lastSeen: new Date(),
        });
      }
    } catch (err) {
      console.error("Error updating offline status:", err);
    }
  });
});

// ----------------------------------------
// START SERVER
// ----------------------------------------
server.listen(8080, () => {
  console.log("Server running at port 8080");
});