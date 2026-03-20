import express from "express";
import {newUserController} from "../controllers/users-controllers.js"
import authMiddleware from "./middleware/auth-middleware.js"
import autorizateMiddleware from "./middleware/autorization-middleware.js"
import loggerMiddleware from "./middleware/logger-middleware.js"
import { logInfo } from "../utils/logger.js";

import accountsRoute from "./accounts-routes.js"
import periodsRoute from "./periods-routes.js"
import budgetRoute from "./budget-routes.js"
import categoriesRoute from "./categories-routes.js"

const router = express.Router();

router.use(authMiddleware)	// Middleware de autenticação
router.use(loggerMiddleware)// Middleware de logging

router.use(accountsRoute); // Rotas de Contas
router.use(periodsRoute); // Rotas de Periodos
router.use(budgetRoute); // Rotas de Budget
router.use(categoriesRoute); // Rotas de Categorias
// router.use(ordersRoute);

router.post('/newUser',autorizateMiddleware(['admin']), newUserController);


export default router;
