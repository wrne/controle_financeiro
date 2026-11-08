import express from "express";
import { getResultsController } from "../controllers/results-controller.js"
import { validate } from "../../../utils/validate.js"
import { yearParams } from "../../budget/budget-schemas.js"

const router = express.Router();

router.get('/results/:year', validate({ params: yearParams }), getResultsController); // Resultado por mês e no ano

export default router;
