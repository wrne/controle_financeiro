import express from "express";
import {newUserController} from "./users/controllers/users-controllers.js"
import authMiddleware from "./middleware/auth-middleware.js"
import autorizateMiddleware from "./middleware/autorization-middleware.js"
import loggerMiddleware from "./middleware/logger-middleware.js"
import { validate } from "../utils/validate.js"
import { newUserSchema } from "./users/users-schemas.js"

import accountsRoute from "./accounts/routes/accounts-routes.js"
import periodsRoute from "./periods/routes/periods-routes.js"
import budgetRoute from "./budget/routes/budget-routes.js"
import categoriesRoute from "./categories/routes/categories-routes.js"
import transactionsRoute from "./transactions/routes/transactions-routes.js"

const router = express.Router();

router.use(authMiddleware)	// Middleware de autenticação
router.use(loggerMiddleware)// Middleware de logging

router.use(accountsRoute); // Rotas de Contas
router.use(periodsRoute); // Rotas de Periodos
router.use(budgetRoute); // Rotas de Budget
router.use(categoriesRoute); // Rotas de Categorias
router.use(transactionsRoute); // Rotas de Transactions
// router.use(ordersRoute);

router.post('/newUser', autorizateMiddleware(['admin']), validate({ body: newUserSchema }), newUserController);


export default router;
