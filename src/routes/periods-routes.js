import express from "express";
import {
	getAllPeriodsController,
	getPeriodController,
	createPeriodController,
	updatePeriodController,
	deletePeriodController
} from "../controllers/periods-controller.js"

const router = express.Router();

/**
 * Rota de Consulta de Periodos - Listagem de acordo com os filtros
 */
router.get('/periods', getAllPeriodsController); // Consulta de Periodos de acordo com os filtros
router.get('/periods/:id', getPeriodController); // Consulta de Periodo específico
router.post('/periods', createPeriodController); // Criação de Periodo
// router.put('/periods/:id', updatePeriodController); // Atualização de Periodo
router.delete('/periods/:id', deletePeriodController); // Exclusão de Periodo


export default router;