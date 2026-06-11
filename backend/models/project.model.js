import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
    required: true,
    trim: true,
  },

  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  fileTree: {
    type: Object,
    default: {},
  },
  whiteboardState: {
    type: Array,
    default: [],
  },
  memory: {
    goal: {
      type: String,
      default: "",
      trim: true,
    },
    stack: {
      type: String,
      default: "",
      trim: true,
    },
    decisions: {
      type: [String],
      default: [],
    },
    knownIssues: {
      type: [String],
      default: [],
    },
    deploymentNotes: {
      type: [String],
      default: [],
    },
    nextSteps: {
      type: [String],
      default: [],
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
});

const Project = mongoose.model("Project", projectSchema);

export default Project;
