import {app} from "./app.js";
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

  socket.on("user-online", async (userId)=>{
    socket.userId = userId;
    await User.findByIdAndUpdate(userId, {isOnline:true});
    io.emit("user-status", {userId, isOnline:true});
  });

  socket.on("typing", ({roomId, userId})=>{
    socket.to(roomId).emit("typing", {userId});

  })

  socket.on("stop-typing", ({roomId, userId})=>{
    socket.to(roomId).emit("stop-typing", {userId});
    
  })

  socket.on("message-read", async (data)=>{
    if(!data) return
    const {roomId, userId } = data
    if(!roomId || !userId) return
    
    await Message.updateMany({
      roomId, senderId: {$ne:userId}, read:false
    }, {read:true})

    socket.to(roomId).emit("message-read", {userId});

  })

  socket.on("disconnect", async ()=>{
    if(socket.userId){
      await User.findByIdAndUpdate(socket.userId, {
        isOnline:false,
        lastSeen: new Date(),
      })

      io.emit("user-status", {userId: socket.userId, isOnline:false, lastSeen: new Date()})
    }
  })

  socket.on("join-chat", async (roomId)=>{
    socket.join(roomId);
    console.log(`${socket.id} joined chat room ${roomId}`)
  });

  socket.on("send-message", async ({roomId, senderId, text})=>{
    try {
      const message = new Message({roomId, senderId, text});
      await message.save();

      io.to(roomId).emit("receive-message", {
        _id:message._id,
        senderId,
        text,
        createdAt: message.createdAt
      })
    } catch (e) {
      console.error("Message save error", e);

      
    }
  })

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
