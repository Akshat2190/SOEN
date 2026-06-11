import "dotenv/config";
import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import projectModel from "./models/project.model.js";
import userModel from "./models/user.model.js";
import { generateResultWithProjectMemory } from "./services/ai.service.js";
import { getProjectMemoryContext } from "./services/project.service.js";
import { getAllowedOrigins } from "./config/cors.js";

const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: getAllowedOrigins(),
    credentials: true,
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

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return next(new Error("Authentication error: Invalid token"));
    }

    const loggedInUser = await userModel.findOne({ email: decoded.email });

    if (!loggedInUser) {
      return next(new Error("Authentication error: User not found"));
    }

    const project = await projectModel.findOne({
      _id: projectId,
      users: loggedInUser._id,
    });

    if (!project) {
      return next(new Error("Authentication error: Project access denied"));
    }

    socket.user = decoded;
    socket.project = project;

    next();
  } catch (error) {
    next(error);
  }
});

io.on("connection", (socket) => {
  socket.roomId = socket.project._id.toString();

  console.log("User connected:", socket.id);

  socket.join(socket.roomId);

  const isSameProjectRoom = (projectId) => !projectId || projectId === socket.roomId;

  socket.on("project-message", async (data) => {
    const message = data.message;

    const aiIsPresentInMessage = message.includes("@ai");
    socket.broadcast.to(socket.roomId).emit("project-message", data);

    if (aiIsPresentInMessage) {
      try {
        const prompt = message.replace("@ai", "");
        const currentProject = await projectModel.findById(socket.project._id);
        const projectMemory = getProjectMemoryContext(currentProject);

        const result = await generateResultWithProjectMemory({
          prompt,
          projectMemory,
          fileTree: currentProject?.fileTree,
        });

        io.to(socket.roomId).emit("project-message", {
          message: result,
          sender: {
            _id: "ai",
            email: "AI",
          },
        });
      } catch (error) {
        console.error("AI Error:", {
          message: error.message,
          code: error.code,
          status: error.status,
          model: error.aiModel,
        });

        const aiMessage = error.code === "AI_CONFIG_MISSING"
          ? "AI is not configured on the server. Add GOOGLE_AI_KEY and restart the backend."
          : "Sorry, the AI service is currently unavailable. Please try again later.";

        // Send error message to client
        io.to(socket.roomId).emit("project-message", {
          message: aiMessage,
          sender: {
            _id: "ai",
            email: "AI",
          },
        });
      }

      return;
    }
  });

  socket.on("whiteboard:draw", (data) => {
    if (!isSameProjectRoom(data?.projectId) || !data?.object) {
      return;
    }

    socket.broadcast.to(socket.roomId).emit("whiteboard:draw", {
      object: data.object,
      userId: socket.user.email,
      email: socket.user.email,
    });
  });

  socket.on("whiteboard:cursor", (data) => {
    if (!isSameProjectRoom(data?.projectId) || typeof data.x !== "number" || typeof data.y !== "number") {
      return;
    }

    socket.broadcast.to(socket.roomId).emit("whiteboard:cursor", {
      userId: socket.user.email,
      email: socket.user.email,
      userName: socket.user.email,
      x: data.x,
      y: data.y,
    });
  });

  socket.on("whiteboard:sync", async (data) => {
    if (!isSameProjectRoom(data?.projectId) || !Array.isArray(data.state)) {
      return;
    }

    socket.broadcast.to(socket.roomId).emit("whiteboard:sync", {
      state: data.state,
      userId: socket.user.email,
      email: socket.user.email,
    });

    try {
      await projectModel.updateOne(
        {
          _id: socket.roomId,
        },
        {
          whiteboardState: data.state,
        }
      );
    } catch (error) {
      console.warn("whiteboard sync save failed", error.message);
    }
  });

  socket.on("whiteboard:clear", async (data) => {
    if (!isSameProjectRoom(data?.projectId)) {
      return;
    }

    socket.broadcast.to(socket.roomId).emit("whiteboard:clear", {
      userId: socket.user.email,
      email: socket.user.email,
    });

    try {
      await projectModel.updateOne(
        {
          _id: socket.roomId,
        },
        {
          whiteboardState: [],
        }
      );
    } catch (error) {
      console.warn("whiteboard clear save failed", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    socket.leave(socket.roomId);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
