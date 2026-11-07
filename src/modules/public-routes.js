import express from "express";
import {authUserController} from "./users/controllers/users-controllers.js"
import { validate } from "../utils/validate.js"
import { loginSchema } from "./users/users-schemas.js"
import { loginLimiter } from "./middleware/rate-limit-middleware.js"

const router = express.Router();

router.post('/login', loginLimiter, validate({ body: loginSchema }), authUserController);

// Verificação de saúde (útil para hospedagem/monitoramento). Não exige autenticação.
router.get('/health', (req, res) => res.success({ status: 'ok' }, 'API online.'));

export default router;
