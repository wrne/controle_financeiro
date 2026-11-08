import express from "express";
import {
	getAllCategoriesController,
	getCategoryController,
	createCategoryController,
	updateCategoryController,
	deleteCategoryController
} from "../controllers/categories-controller.js"
import { validate, idParams } from "../../../utils/validate.js"
import { createCategorySchema, updateCategorySchema, categoryFilters } from "../categories-schemas.js"

const router = express.Router();

router.get('/categories', validate({ query: categoryFilters }), getAllCategoriesController); // Listagem (filtros: groupId, includeArchived)
router.get('/categories/:id', validate({ params: idParams }), getCategoryController); // Consulta específica
router.post('/categories', validate({ body: createCategorySchema }), createCategoryController); // Criação
router.put('/categories/:id', validate({ params: idParams, body: updateCategorySchema }), updateCategoryController); // Atualização (envie apenas os campos a alterar)
router.delete('/categories/:id', validate({ params: idParams }), deleteCategoryController); // Exclusão (409 se tiver orçado ou lançamentos: arquive)

export default router;
