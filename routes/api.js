import { Router } from 'express';
import AuthController from '../controller/authcontroller.js';
import authMiddleware from '../middleware/Authenticate.js';
import StoreController from '../controller/StoreController.js';
import ProfileController from '../controller/ProfileController.js';
import StatisticsApi from '../controller/Statistics.js';

const routes = Router();

// Authentication Routes
routes.post('/auth/register', AuthController.register);
routes.post('/auth/login', AuthController.Login);


routes.get('/profile/v1/account',authMiddleware,ProfileController.index)
routes.put('/profile/v1/update/:email',authMiddleware,ProfileController.update)
routes.delete('/profile/v1/delete/:id',authMiddleware,ProfileController.delete)
// Store Routes
routes.post('/store/v1', authMiddleware, StoreController.store);
routes.get("/store/v1/:id",authMiddleware,StoreController.indexatApi);
routes.get('/store/v1/index',StoreController.index)
routes.post('/store/v1/database',authMiddleware,StoreController.storefromApi);
routes.put('/store/v1/update/:id',authMiddleware,StoreController.update)
routes.delete('/store/v1/delete/:id',authMiddleware,StoreController.delete);


//*Statistics

routes.put('/store/v1/statistics',StatisticsApi.getmonth)
routes.get('/store/v1/search/statistics/',StatisticsApi.search);
routes.get('/store/v1/range/statistics',StatisticsApi.getPriceRange);
routes.get('/store/v1/unique/category/statistics',StatisticsApi.getUniqueCategory)
routes.get('/store/v1/total/sale/statistics',StatisticsApi.totalStatistics)
routes.get('/store/v1/all/statistics',StatisticsApi.allStats)
export default routes;
