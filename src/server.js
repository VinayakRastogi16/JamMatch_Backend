import { app } from "./app.js";
import http from "http";
import { Server } from "socket.io";
import { Message } from "./models/messages.model.js";
import { User } from "./models/user.model.js";
import createNotification from "./services/notification.services.js";
import { disconnect } from "cluster";

const server = http.createServer(app);

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

      io.emit("user-status", {
        userId,
        isOnline: true,
      });
    } catch (e) {
      console.error("Error setting user Online:", e);
    }
  });

  socket.on("disconnect", async () => {
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

  socket.on("send-message", async ({roomId, text})=>{
    if(!socket.userId)return;
    if(!roomId)return;
    if(!text||!text.trim())return;

    const message = new Message({
      roomId,
      senderId:socket.userId,
      text:text.trim()
    })

    await message.save();

    io.to(roomId).emit("recieve-message", message);
  });

});
