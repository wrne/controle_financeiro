import express from "express";
import {
	getAllBudgetController,
	getBudgetController,
	createBudgetController,
	updateBudgetController,
	deleteBudgetController
} from "../controllers/budget-controller.js"
import { validate, idParams } from "../../../utils/validate.js"
import { createBudgetSchema, updateBudgetSchema, budgetFilters } from "../budget-schemas.js"

const router = express.Router();

router.get('/budget', validate({ query: budgetFilters }), getAllBudgetController); // Listagem (aceita filtros via query string)
router.get('/budget/:id', validate({ params: idParams }), getBudgetController); // Consulta específica
router.post('/budget', validate({ body: createBudgetSchema }), createBudgetController); // Criação
router.put('/budget/:id', validate({ params: idParams, body: updateBudgetSchema }), updateBudgetController); // Atualização (envie apenas os campos a alterar)
router.delete('/budget/:id', validate({ params: idParams }), deleteBudgetController); // Exclusão

export default router;
