require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");

require("./config/db");

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:4200",
  credentials: true,
  optionsSuccessStatus: 200
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:4200",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Pass io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/tasks", require("./routes/task.routes"));
app.use("/api/categories", require("./routes/category.routes"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with Socket.io support`);
});
