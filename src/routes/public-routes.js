import express from "express";
import {authUserController} from "../controllers/users-controllers.js"

const router = express.Router();

router.post('/login', authUserController);

let counter = 0
router.get('/test', async (req, res) => {

	try {

		counter++
		
		if (counter >= 3) {
			counter = 0
			throw new Error('Limite de acessos atingido. Tente novamente mais tarde.')
		}
		res.success({ message: 'Rota de teste' }, 'Rota de teste funcionando.')

	} catch (error) {

		res.error(500, error, `Erro na rota de teste`)

	}

});
export default router;