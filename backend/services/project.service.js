import mongoose from "mongoose";
import projectModel from "../models/project.model.js";

const memoryListFields = ["decisions", "knownIssues", "deploymentNotes", "nextSteps"];

export const normalizeProjectMemory = (memory = {}) => ({
  goal: typeof memory.goal === "string" ? memory.goal.trim() : "",
  stack: typeof memory.stack === "string" ? memory.stack.trim() : "",
  decisions: normalizeMemoryList(memory.decisions),
  knownIssues: normalizeMemoryList(memory.knownIssues),
  deploymentNotes: normalizeMemoryList(memory.deploymentNotes),
  nextSteps: normalizeMemoryList(memory.nextSteps),
  updatedAt: new Date(),
});

export const normalizeProjectMemoryPatch = (memory = {}) => {
  const patch = {};

  if (typeof memory.goal === "string" && memory.goal.trim()) {
    patch.goal = memory.goal.trim();
  }

  if (typeof memory.stack === "string" && memory.stack.trim()) {
    patch.stack = memory.stack.trim();
  }

  memoryListFields.forEach((field) => {
    const list = normalizeMemoryList(memory[field]);

    if (list.length) {
      patch[field] = list;
    }
  });

  return patch;
};

function normalizeMemoryList(value) {
  if (Array.isArray(value)) {
    return value
      .filter((item) => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 12);
  }

  if (typeof value === "string") {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 12);
  }

  return [];
}

function validateProjectAndUserIds({ projectId, userId }) {
  if (!projectId) {
    throw new Error("ProjectId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid projectId");
  }

  if (!userId) {
    throw new Error("userId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }
}

export const createProject = async ({ name, userId }) => {
  if (!name) {
    throw new Error("Name is required");
  }

  if (!userId) {
    throw new Error("User is required");
  }

    const project = await projectModel.create({
      name,
      users: [userId],
    });
    
    return project;

};

export const getAllProjectsByUserId = async ({userId}) => {
  if (!userId) {
    throw new Error("UserId is required");
  }


  const allUserProjects = await projectModel.find({
    users: userId
  })
  return allUserProjects;
}

export const addUsersToProject = async ({projectId, users, userId}) => {
  
  if (!projectId) {
    throw new Error("ProjectId is required");    
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid projectId");    
  }

  if (!users) {
    throw new Error("users are required");    
  }

  if (!Array.isArray(users) || users.some(userId => !mongoose.Types.ObjectId.isValid(userId))) {
    throw new Error("Invalid userId(s) in users array");    
  }

  if (!userId) {
    throw new Error("userId is required");    
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");    
  }

  const project = await projectModel.findOne({
    _id: projectId,
    users: userId
  });

  if (!project) {
    throw new Error("User not belongs to the project");    
  }

  const updatedProject = await projectModel.findByIdAndUpdate({
    _id: projectId
  }, {
    $addToSet: { users: { $each: users } }
  }, {
    new: true
  }).populate('users')

  return updatedProject;

}

export const getProjectById = async ({projectId, userId}) => {
  validateProjectAndUserIds({ projectId, userId });

  const project = await projectModel.findOne({
    _id: projectId,
    users: userId
  }).populate('users')

  if (!project) {
    throw new Error("Project not found or access denied");
  }

  return project;
}

export const updateFileTree = async ({projectId, fileTree, userId}) => {
  validateProjectAndUserIds({ projectId, userId });

  if (!fileTree) {
    throw new Error("fileTree is required");
  }

  const project = await projectModel.findOneAndUpdate({
    _id: projectId,
    users: userId
  }, {
    fileTree
  }, {
    new: true
  });

  if (!project) {
    throw new Error("Project not found or access denied");
  }

  return project;
}

export const updateProjectMemory = async ({ projectId, memory, userId }) => {
  validateProjectAndUserIds({ projectId, userId });

  if (!memory || typeof memory !== "object" || Array.isArray(memory)) {
    throw new Error("memory is required and must be an object");
  }

  const normalizedMemory = normalizeProjectMemory(memory);

  const project = await projectModel.findOneAndUpdate(
    {
      _id: projectId,
      users: userId,
    },
    {
      memory: normalizedMemory,
    },
    {
      new: true,
    }
  ).populate("users");

  if (!project) {
    throw new Error("Project not found or access denied");
  }

  return project;
};

export const getWhiteboardState = async ({ projectId, userId }) => {
  const project = await getProjectById({ projectId, userId });
  return Array.isArray(project.whiteboardState) ? project.whiteboardState : [];
};

export const updateWhiteboardState = async ({ projectId, state, userId }) => {
  validateProjectAndUserIds({ projectId, userId });

  if (!Array.isArray(state)) {
    throw new Error("whiteboard state must be an array");
  }

  const project = await projectModel.findOneAndUpdate(
    {
      _id: projectId,
      users: userId,
    },
    {
      whiteboardState: state,
    },
    {
      new: true,
    }
  ).populate("users");

  if (!project) {
    throw new Error("Project not found or access denied");
  }

  return project;
};

export const getProjectMemoryContext = (project) => {
  const memory = project?.memory || {};
  const sections = [
    memory.goal ? `Goal: ${memory.goal}` : null,
    memory.stack ? `Stack: ${memory.stack}` : null,
    ...memoryListFields.flatMap((field) => {
      const value = memory[field];
      if (!Array.isArray(value) || value.length === 0) return [];

      const label = field
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (letter) => letter.toUpperCase());

      return [`${label}: ${value.join("; ")}`];
    }),
  ].filter(Boolean);

  return sections.length
    ? sections.join("\n")
    : "No saved project memory yet. Infer carefully from the user's request and existing files.";
};
