import {app} from "./app.js";
import http from "http";
import { Server } from "socket.io";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", async (roomId) => {
  const clients = io.sockets.adapter.rooms.get(roomId);
  const numClients = clients ? clients.size : 0;

  // max 2 people per room
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
  console.log("server runnig at port 8080");
});
