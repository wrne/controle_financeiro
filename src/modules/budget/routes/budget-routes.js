import express from "express";
import {
	getAllBudgetController,
	getBudgetController,
	createBudgetController,
	updateBudgetController,
	deleteBudgetController
} from "../controllers/budget-controller.js"

const router = express.Router();

/**
 * Rota de Consulta de Budget - Listagem de acordo com os filtros
 */
router.get('/budget', getAllBudgetController); // Consulta de Budget de acordo com os filtros
router.get('/budget/:id', getBudgetController); // Consulta de Budget específico
router.post('/budget', createBudgetController); // Criação de Budget
// router.put('/budget/:id', updateBudgetController); // Atualização de Budget
router.delete('/budget/:id', deleteBudgetController); // Exclusão de Budget


export default router;
