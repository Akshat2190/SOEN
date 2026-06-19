import projectModel from "../models/project.model.js";
import * as projectService from "../services/project.service.js";
import * as aiService from "../services/ai.service.js";
import userModel from "../models/user.model.js";
import {validationResult} from "express-validator";

function parseAiJson(rawValue) {
    try {
        return JSON.parse(rawValue);
    } catch {
        const cleanedValue = rawValue
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/```$/i, "")
            .trim();

        return JSON.parse(cleanedValue);
    }
}


export const createProject = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    try {

        const {name} = req.body;
        const loggedInUser = await userModel.findOne({email: req.user.email});
        const userId = loggedInUser._id;
    
        const newProject = await projectService.createProject({
            name,
            userId
        });
    
        res.status(201).json(newProject);

    } catch (err) {
        console.log(err)
        res.status(500).send(err.message);
    }


}

export const getAllProjects = async (req, res) => {
    try {

        const loggedInUser = await userModel.findOne({email: req.user.email});

        const allUserProjects = await projectService.getAllProjectsByUserId({
            userId: loggedInUser._id
        })

        return res.status(200).json({projects: allUserProjects});
        
    } catch (err) {
        console.log(err)
        res.status(400).json({err:err.message});
    }
}

export const addUserToProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    try {

        const {projectId, users} = req.body;

        const loggedInUser = await userModel.findOne({email: req.user.email});

        const project = await projectService.addUsersToProject({
            projectId,
            users,
            userId: loggedInUser._id
        })

        return res.status(200).json({
            project
        });
        
    } catch (err) {
        console.log(err)
        res.status(400).json({error: err.message});
    }

}

export const removeUserFromProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const {projectId, userId: targetUserId} = req.body;

        const loggedInUser = await userModel.findOne({email: req.user.email});

        const project = await projectService.removeUserFromProject({
            projectId,
            targetUserId,
            userId: loggedInUser._id
        });

        return res.status(200).json({
            project
        });
    } catch (err) {
        console.log(err)
        res.status(400).json({error: err.message});
    }
}

export const getProjectById = async (req, res) => {

    const {projectId} = req.params;

    try {
        const loggedInUser = await userModel.findOne({email: req.user.email});

        const project = await projectService.getProjectById({
            projectId,
            userId: loggedInUser._id
        });

        return res.status(200).json({project});
    }catch (err) {
        console.log(err)
        res.status(400).json({error: err.message});
    }

}

export const updateFileTree = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const {projectId, fileTree} = req.body;
        const loggedInUser = await userModel.findOne({email: req.user.email});

        const project = await projectService.updateFileTree({
            projectId,
            fileTree,
            userId: loggedInUser._id
        })

        return res.status(200).json({project});
        
    } catch (error) {
        console.log(error)
        res.status(400).json({error: error.message});
    }
}

export const updateDocumentContent = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const {projectId, documentContent} = req.body;
        const loggedInUser = await userModel.findOne({email: req.user.email});

        const project = await projectService.updateDocumentContent({
            projectId,
            documentContent,
            userId: loggedInUser._id
        });

        return res.status(200).json({project, documentContent: project.documentContent});
    } catch (error) {
        console.log(error)
        res.status(400).json({error: error.message});
    }
}

export const getWhiteboardState = async (req, res) => {
    const {projectId} = req.params;

    try {
        const loggedInUser = await userModel.findOne({email: req.user.email});

        const whiteboardState = await projectService.getWhiteboardState({
            projectId,
            userId: loggedInUser._id
        });

        return res.status(200).json({whiteboardState});
    } catch (error) {
        console.log(error)
        res.status(400).json({error: error.message});
    }
}

export const updateWhiteboardState = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const {projectId, state} = req.body;
        const loggedInUser = await userModel.findOne({email: req.user.email});

        const project = await projectService.updateWhiteboardState({
            projectId,
            state,
            userId: loggedInUser._id
        });

        return res.status(200).json({
            project,
            whiteboardState: project.whiteboardState
        });
    } catch (error) {
        console.log(error)
        res.status(400).json({error: error.message});
    }
}

export const updateProjectMemory = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const {projectId, memory} = req.body;
        const loggedInUser = await userModel.findOne({email: req.user.email});

        const project = await projectService.updateProjectMemory({
            projectId,
            memory,
            userId: loggedInUser._id
        });

        return res.status(200).json({project, memory: project.memory});
    } catch (error) {
        console.log(error)
        res.status(400).json({error: error.message});
    }
}

export const generateProjectMemory = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const {projectId} = req.body;
        const loggedInUser = await userModel.findOne({email: req.user.email});

        const project = await projectService.getProjectById({
            projectId,
            userId: loggedInUser._id
        });

        const rawMemory = await aiService.generateProjectMemory({
            projectName: project.name,
            existingMemory: project.memory,
            fileTree: project.fileTree
        });

        const generatedMemory = projectService.normalizeProjectMemory(parseAiJson(rawMemory));
        const updatedProject = await projectService.updateProjectMemory({
            projectId,
            memory: generatedMemory,
            userId: loggedInUser._id
        });

        return res.status(200).json({project: updatedProject, memory: updatedProject.memory});
    } catch (error) {
        console.log(error)
        res.status(400).json({error: error.message});
    }
}

export const suggestProjectMemory = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const {projectId, eventType, content} = req.body;
        const loggedInUser = await userModel.findOne({email: req.user.email});

        const project = await projectService.getProjectById({
            projectId,
            userId: loggedInUser._id
        });

        const rawSuggestion = await aiService.generateMemorySuggestion({
            projectName: project.name,
            existingMemory: project.memory,
            fileTree: project.fileTree,
            eventType,
            content
        });

        const parsedSuggestion = parseAiJson(rawSuggestion);
        const memoryPatch = projectService.normalizeProjectMemoryPatch(
            parsedSuggestion.memory || {}
        );
        const hasPatch = Object.keys(memoryPatch).length > 0;

        return res.status(200).json({
            shouldSuggest: Boolean(parsedSuggestion.shouldSuggest && hasPatch),
            reason: parsedSuggestion.reason || "Memory update suggested",
            memory: memoryPatch
        });
    } catch (error) {
        console.log(error)
        res.status(400).json({error: error.message});
    }
}
