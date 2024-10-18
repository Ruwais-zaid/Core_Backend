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
routes.post('/store/v1', authMiddleware, StoreController.store);
routes.get('/store/v1/index',StoreController.index)
routes.post('/store/v1/database',authMiddleware,StoreController.storefromApi);
routes.put('/store/v1/update/:id',authMiddleware,StoreController.update)
routes.delete('/store/v1/delete/:id',authMiddleware,StoreController.delete);

export default routes;
