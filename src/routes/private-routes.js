import express from "express";
import {newUserController} from "../controllers/users/users-controllers.js"
import authMiddleware from "./middleware/auth-middleware.js"
import autorizateMiddleware from "./middleware/autorization-middleware.js"
import loggerMiddleware from "./middleware/logger-middleware.js"
import { logInfo } from "../utils/logger.js";


const router = express.Router();

router.use(authMiddleware)	// Middleware de autenticação
router.use(loggerMiddleware)// Middleware de logging

// router.use(ordersRoute);

router.post('/newUser',autorizateMiddleware(['admin']), newUserController);


export default router;
