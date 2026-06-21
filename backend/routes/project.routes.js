import {Router} from 'express';
import { body } from 'express-validator';
import * as projectController from '../controllers/project.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = Router();


router.post('/create', 
    authMiddleware.authUser,
    body('name').isString().withMessage('Name is required'),
    // controller function here
    projectController.createProject
)

router.get('/all',
    authMiddleware.authUser,
    projectController.getAllProjects
)

router.put('/add-user',
    authMiddleware.authUser,
    body('projectId').isString().withMessage('ProjectId is required'),
    body('users').isArray().withMessage('Users must be an array of Strings').bail()
        .custom((users) => users.every(user => typeof user === 'string')).withMessage('Each user must be an array of Strings'),
    projectController.addUserToProject
)

router.put('/remove-user',
    authMiddleware.authUser,
    body('projectId').isString().withMessage('ProjectId is required'),
    body('userId').isString().withMessage('UserId is required'),
    projectController.removeUserFromProject
)

router.get("/get-project/:projectId", authMiddleware.authUser, projectController.getProjectById);

router.put("/update-file-tree", authMiddleware.authUser, //"/update-file-tree/:projectId",
    body('projectId').isString().withMessage('ProjectId is required'),
    body('fileTree').isObject().withMessage('fileTree is required and must be an object'),
    projectController.updateFileTree);

router.put("/update-document",
    authMiddleware.authUser,
    body('projectId').isString().withMessage('ProjectId is required'),
    body('documentContent').isString().withMessage('documentContent is required and must be a string'),
    projectController.updateDocumentContent);

router.get("/get-whiteboard/:projectId",
    authMiddleware.authUser,
    projectController.getWhiteboardState);

router.put("/update-whiteboard",
    authMiddleware.authUser,
    body('projectId').isString().withMessage('ProjectId is required'),
    body('state').isArray().withMessage('state is required and must be an array'),
    projectController.updateWhiteboardState);

router.put("/update-memory",
    authMiddleware.authUser,
    body('projectId').isString().withMessage('ProjectId is required'),
    body('memory').isObject().withMessage('memory is required and must be an object'),
    projectController.updateProjectMemory);

router.post("/generate-memory",
    authMiddleware.authUser,
    body('projectId').isString().withMessage('ProjectId is required'),
    projectController.generateProjectMemory);

router.post("/suggest-memory",
    authMiddleware.authUser,
    body('projectId').isString().withMessage('ProjectId is required'),
    body('content').isString().trim().isLength({ min: 3 }).withMessage('content is required'),
    projectController.suggestProjectMemory);

router.delete('/delete-project/:projectId',
    authMiddleware.authUser,
    projectController.deleteProject);

export default router;
