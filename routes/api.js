import { Router } from 'express';
import AuthController from '../controller/authcontroller.js';
import authMiddleware from '../middleware/Authenticate.js';
import StoreController from '../controller/StoreController.js';
import ProfileController from '../controller/ProfileController.js';

const routes = Router();

// Authentication Routes
routes.post('/auth/register', AuthController.register);
routes.post('/auth/login', AuthController.Login);


routes.get('/profile',authMiddleware,ProfileController.index)
// Store Routes
routes.post('/store', authMiddleware, StoreController.store);
routes.post('/store/v1/database',authMiddleware,StoreController.storefromApi);
routes.put('/store/v1/update/:id',authMiddleware,StoreController.update)

export default routes;
