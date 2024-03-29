import { Server } from "socket.io";
import express from "express";
import cors from "cors";
const app = express();
const http = require("http").createServer(app);
const io = new Server(http, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"], // Allow GET and POST methods
  },
});
app.use(cors());
const time = new Date().toLocaleTimeString();

const emailToSocket = new Map();
const socketToEmail = new Map();

io.on("connection", (socket) => {
  console.log(`Socket Connected: ${socket.id}`);

  socket.on("room:join", (data) => {
    const { userID, room } = data;
    emailToSocket.set(userID, socket.id);
    socketToEmail.set(socket.id, userID);

    socket.join(room);
    io.to(room).emit("user:joined", { userID, id: socket.id });

    // emits a 'room:joined' event back to the client
    // that just joined the room.
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incoming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  socket.on("call:end", ({ to }) => {
    io.to(to).emit("call:end", { from: socket.id });
  });

  socket.on("call:initiated", ({ to }) => {
    io.to(to).emit("call:initiated", { from: socket.id });
  });
});

http.listen(3001, `0.0.0.0`, () =>
  console.log(time + "Server running on port 3001")
);
