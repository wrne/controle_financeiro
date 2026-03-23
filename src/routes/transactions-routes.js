import express from "express";
import {
	getAllTransactionsController,
	getTransactionController,
	createTransactionController,
	updateTransactionController,
	deleteTransactionController
} from "../controllers/transactions-controller.js"

const router = express.Router();

/**
 * Rota de Consulta de Transactions - Listagem de acordo com os filtros
 */
router.get('/transactions', getAllTransactionsController); // Consulta de Transactions de acordo com os filtros
router.get('/transactions/:id', getTransactionController); // Consulta de Transaction específica
router.post('/transactions', createTransactionController); // Criação de Transaction
// router.put('/transactions/:id', updateTransactionController); // Atualização de Transaction
router.delete('/transactions/:id', deleteTransactionController); // Exclusão de Transaction


export default router;
