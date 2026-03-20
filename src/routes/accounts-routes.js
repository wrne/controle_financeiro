import express from "express";
import {
	getAllAccountsController,
	getAccountController,
	createAccountController,
	updateAccountController,
	deleteAccountController
} from "../controllers/accounts-controller.js"

const router = express.Router();

/**
 * Rota de Consulta de pedidos - Listagem de acordo com os filtros
 */
router.get('/accounts', getAllAccountsController); // Consulta de Contas de acordo com os filtros
router.get('/accounts/:id', getAccountController); // Consulta de Conta especifíca
router.post('/accounts', createAccountController); // Criação de Conta
// router.put('/accounts/:id', updateAccountController); // Atualização de Conta
router.delete('/accounts/:id', deleteAccountController); // Exclusão de Conta


export default router;