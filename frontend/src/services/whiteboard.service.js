import axios from "../config/axios";

export const whiteboardService = {
  async getWhiteboard(projectId) {
    const response = await axios.get(`/projects/get-whiteboard/${projectId}`);
    return response.data;
  },

  async saveWhiteboard(projectId, state) {
    const response = await axios.put("/projects/update-whiteboard", {
      projectId,
      state,
    });
    return response.data;
  },
};
