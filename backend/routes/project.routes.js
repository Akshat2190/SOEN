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


router.get("/get-project/:projectId", authMiddleware.authUser, projectController.getProjectById);

export default router;