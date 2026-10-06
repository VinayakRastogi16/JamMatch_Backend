import { app } from "./app.js";
import http from "http";
import { Server } from "socket.io";
import { Message } from "./models/messages.model.js";
import { User } from "./models/user.model.js";
import createNotification from "./services/notification.services.js";

const server = http.createServer(app);

server.listen(process.env.PORT);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("user-online", async (userId) => {
    try {
      socket.userId = userId;

      await User.findByIdAndUpdate(userId, {
        isOnline: true,
      });

      const onlineUsers = await User.find({
        isOnline: true,
      }).select("_id");

      socket.emit("online-users", onlineUsers);

      io.emit("user-status", {
        userId,
        isOnline: true,
      });
    } catch (e) {
      console.error("Error setting user Online:", e);
    }
  });

  socket.on("disconnect", async () => {
    if (socket.audioRoomId) {
      const audioRoomId = socket.audioRoomId;

      socket.to(audioRoomId).emit("audio-room-user-left", {
        socketId: socket.id,
        userId: socket.userId,
      });

      socket.audioRoomId = null;
      console.log(`Socket ${socket.id} disconnected from audio room`);
    }

    console.log("Socket disconnected:", socket.id);
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
  });

  socket.on("join-chat", (roomId) => {
    if (roomId) {
      socket.join(roomId);
    }
  });

  socket.on("typing", ({ roomId, userId }) => {
    if (roomId && userId) {
      socket.to(roomId).emit("typing", { userId });
    }
  });

  socket.on("stop-typing", ({ roomId, userId }) => {
    if (roomId && userId) {
      socket.to(roomId).emit("stop-typing", { userId });
    }
  });

  socket.on("message-read", async ({ roomId, userId }) => {
    if (roomId && userId) {
      await Message.updateMany(
        {
          roomId,
          senderId: { $ne: userId },
          isSeen: false,
        },
        {
          isSeen: true,
        },
      );

      socket.to(roomId).emit("message-read", {
        userId,
      });
    }
  });

  socket.on("send-message", async ({ roomId, text }) => {
    if (!socket.userId) return;
    if (!roomId) return;
    if (!text || !text.trim()) return;

    const message = new Message({
      roomId,
      senderId: socket.userId,
      text: text.trim(),
    });

    const userIds = roomId.split("_");

    const recipientId = userIds.find((id) => id !== socket.userId);

    if (!recipientId) return;

    const recipient = await User.findById(recipientId);
    const sender = await User.findById(socket.userId);

    if (!recipient) return;

    await message.save();

    io.to(roomId).emit("receive-message", message);

    await createNotification({
      recipient: recipientId,
      sender: socket.userId,
      type: "MESSAGE",
      title: "New message ✉️",
      message: `${sender.username} sent you a message`,
      relatedId: message._id,
      isRecipientOnline: recipient.isOnline,
    });
  });

  socket.on("join-room", (roomId) => {
    console.log("Join room", roomId);

    const clients = io.sockets.adapter.rooms.get(roomId);

    const numClients = clients ? clients.size : 0;

    console.log("clients in room:", numClients);
    console.log("socket IDs:", clients ? [...clients] : []);

    if (numClients >= 2) {
      socket.emit("room-full");
      return;
    }

    socket.join(roomId);

    if (numClients == 0) {
      console.log("Assigning receiver:", socket.id);
      socket.emit("role", "reciever");
    } else if (numClients == 1) {
      console.log("Assigning caller:", socket.id);
      socket.emit("role", "caller");
      socket.to(roomId).emit("caller-joined");
    }
  });

  socket.on("join-audio-room", ({ roomId }) => {
    if (!roomId) return;

    const audioRoomId = `audio_${roomId}`;

    socket.join(audioRoomId);

    socket.audioRoomId = audioRoomId;

    console.log(`Socket ${socket.id} joined audio room ${roomId}`);

    socket.to(audioRoomId).emit("audio-room-user-joined", {
      socketId: socket.id,
      userId: socket.userId,
    });
  });

  socket.on("leave-audio-room", () => {
    if (!socket.audioRoomId) return;

    const audioRoomId = socket.audioRoomId;

    socket.leave(audioRoomId);

    socket.to(audioRoomId).emit("audio-room-user-left", {
      socketId: socket.id,
      userId: socket.userId,
    });

    socket.audioRoomId = null;
    console.log(`Socket ${socket.id} left audio room`);
  });

  socket.on("call-ended", ({ roomId }) => {
    if (!roomId) return;

    socket.to(roomId).emit("call-ended");
  });

  socket.on("offer", ({ roomId, offer }) => {
    if (!roomId || !offer) return;

    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", ({ roomId, answer }) => {
    if (!roomId || !answer) return;
    socket.to(roomId).emit("answer", answer);
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    if (!roomId || !candidate) return;
    socket.to(roomId).emit("ice-candidate", candidate);
  });
});
