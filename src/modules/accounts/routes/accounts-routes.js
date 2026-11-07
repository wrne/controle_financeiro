import express from "express";
import {
	getAllAccountsController,
	getAccountController,
	createAccountController,
	updateAccountController,
	deleteAccountController
} from "../controllers/accounts-controller.js"
import { validate, idParams } from "../../../utils/validate.js"
import { createAccountSchema, updateAccountSchema } from "../accounts-schemas.js"

const router = express.Router();

router.get('/accounts', getAllAccountsController); // Listagem
router.get('/accounts/:id', validate({ params: idParams }), getAccountController); // Consulta específica
router.post('/accounts', validate({ body: createAccountSchema }), createAccountController); // Criação
router.put('/accounts/:id', validate({ params: idParams, body: updateAccountSchema }), updateAccountController); // Atualização (envie apenas os campos a alterar)
router.delete('/accounts/:id', validate({ params: idParams }), deleteAccountController); // Exclusão

export default router;
