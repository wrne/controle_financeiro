import express from "express";
import {
	listGroupsController,
	getGroupController,
	createGroupController,
	updateGroupController,
	deleteGroupController
} from "../controllers/category-groups-controller.js"
import { validate, idParams } from "../../../utils/validate.js"
import { createGroupSchema, updateGroupSchema, groupFilters } from "../category-groups-schemas.js"

const router = express.Router();

router.get('/category-groups', validate({ query: groupFilters }), listGroupsController); // Listagem, com as categorias de cada grupo
router.get('/category-groups/:id', validate({ params: idParams }), getGroupController); // Consulta específica (inclui categorias arquivadas)
router.post('/category-groups', validate({ body: createGroupSchema }), createGroupController); // Criação
router.put('/category-groups/:id', validate({ params: idParams, body: updateGroupSchema }), updateGroupController); // Atualização (envie apenas os campos a alterar)
router.delete('/category-groups/:id', validate({ params: idParams }), deleteGroupController); // Exclusão (só sem categorias)

export default router;
