import express from "express";
import {
	getAllTransactionsController,
	getTransactionController,
	createTransactionController,
	updateTransactionController,
	deleteTransactionController
} from "../controllers/transactions-controller.js"
import { validate, idParams } from "../../../utils/validate.js"
import { createTransactionSchema, updateTransactionSchema, transactionFilters } from "../transactions-schemas.js"

const router = express.Router();

router.get('/transactions', validate({ query: transactionFilters }), getAllTransactionsController); // Listagem (aceita filtros via query string)
router.get('/transactions/:id', validate({ params: idParams }), getTransactionController); // Consulta específica
router.post('/transactions', validate({ body: createTransactionSchema }), createTransactionController); // Criação
router.put('/transactions/:id', validate({ params: idParams, body: updateTransactionSchema }), updateTransactionController); // Atualização (envie apenas os campos a alterar)
router.delete('/transactions/:id', validate({ params: idParams }), deleteTransactionController); // Exclusão

export default router;
