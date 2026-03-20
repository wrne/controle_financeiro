import express from "express";
import {
	getAllCategoriesController,
	getCategoryController,
	createCategoryController,
	updateCategoryController,
	deleteCategoryController
} from "../controllers/categories-controller.js"

const router = express.Router();

/**
 * Rota de Consulta de Categorias - Listagem de acordo com os filtros
 */
router.get('/categories', getAllCategoriesController); // Consulta de Categorias de acordo com os filtros
router.get('/categories/:id', getCategoryController); // Consulta de Categoria específica
router.post('/categories', createCategoryController); // Criação de Categoria
// router.put('/categories/:id', updateCategoryController); // Atualização de Categoria
router.delete('/categories/:id', deleteCategoryController); // Exclusão de Categoria


export default router;
