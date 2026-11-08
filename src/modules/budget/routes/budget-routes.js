import express from "express";
import { getBudgetGridController, setBudgetItemController, setBudgetNoteController, replicateBudgetController } from "../controllers/budget-controller.js"
import { validate } from "../../../utils/validate.js"
import { yearParams, gridFilters, itemParams, setItemSchema, setNoteSchema, replicateSchema } from "../budget-schemas.js"

const router = express.Router();

router.get('/budget/:year', validate({ params: yearParams, query: gridFilters }), getBudgetGridController); // Grade do ano: categoria × 12 meses, com subtotais
router.put('/budget/:year/:month/categories/:categoryId', validate({ params: itemParams, body: setItemSchema }), setBudgetItemController); // Grava um valor (null remove)
router.put('/budget/:year/:month/categories/:categoryId/note', validate({ params: itemParams, body: setNoteSchema }), setBudgetNoteController); // Grava o comentário da célula (vazio remove)
router.post('/budget/:year/replicate', validate({ params: yearParams, body: replicateSchema }), replicateBudgetController); // Copia o valor de um mês para os seguintes

export default router;
