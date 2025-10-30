import "dotenv/config";
import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cors from "cors";
import mongoose from "mongoose";
import projectModel from "./models/project.model.js";
import { generateResult } from "./services/ai.service.js";

app.use(cors());

const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.split(" ")[1];
    const projectId = socket.handshake.query?.projectId;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error("Authentication error: Invalid project ID"));
    }

    socket.project = await projectModel.findById(projectId);

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return next(new Error("Authentication error: Invalid token"));
    }

    socket.user = decoded;

    next();
  } catch (error) {
    next(error);
  }
});

io.on("connection", (socket) => {
  socket.roomId = socket.project._id.toString();

  console.log("✓ User connected:", socket.id);

  socket.join(socket.roomId);

  socket.on("project-message", async (data) => {
    const message = data.message;

    const aiIsPresentInMessage = message.includes("@ai");
    socket.broadcast.to(socket.roomId).emit("project-message", data);

    if (aiIsPresentInMessage) {
      try {
        const prompt = message.replace("@ai", "");

        const result = await generateResult(prompt);

        io.to(socket.roomId).emit("project-message", {
          message: result,
          sender: {
            _id: "ai",
            email: "AI",
          },
        });
      } catch (error) {
        console.error("AI Error:", error.message);

        // Send error message to client
        io.to(socket.roomId).emit("project-message", {
          message:
            "Sorry, the AI service is currently unavailable. Please try again later.",
          sender: {
            _id: "ai",
            email: "AI",
          },
        });
      }

      return;
    }
  });

  socket.on("disconnect", () => {
    console.log("✗ User disconnected");
    socket.leave(socket.roomId);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
