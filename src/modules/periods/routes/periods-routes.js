import express from "express";
import {
	getAllPeriodsController,
	getPeriodController,
	createPeriodController,
	updatePeriodController,
	deletePeriodController
} from "../controllers/periods-controller.js"
import { validate, idParams } from "../../../utils/validate.js"
import { createPeriodSchema, updatePeriodSchema, periodFilters } from "../periods-schemas.js"

const router = express.Router();

router.get('/periods', validate({ query: periodFilters }), getAllPeriodsController); // Listagem (aceita filtros via query string)
router.get('/periods/:id', validate({ params: idParams }), getPeriodController); // Consulta específica
router.post('/periods', validate({ body: createPeriodSchema }), createPeriodController); // Criação
router.put('/periods/:id', validate({ params: idParams, body: updatePeriodSchema }), updatePeriodController); // Atualização (envie apenas os campos a alterar)
router.delete('/periods/:id', validate({ params: idParams }), deletePeriodController); // Exclusão

export default router;
