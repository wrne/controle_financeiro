import AuthUtils from "../../utils/auth-utils.js"
import { getStorage } from "../../utils/context-utils.js";
import { AppError } from "../../utils/app-error.js";
import { getUserId } from "../users/services/user-services.js";

/**
 * Middleware de autenticação que verifica se o token JWT enviado na requisição é válido
 */
export default async function authMiddleware(req, res, next) {

	console.log(`Request URL: ${req.originalUrl}`)
	console.log(`Request Method: ${req.method}`)

	try {

		// Formato esperado: "Authorization: Bearer <token>"
		const authHeader = req.headers.authorization

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			throw new AppError(401, 'Authentication token not supplied.')
		}

		const token = authHeader.slice(7).trim()

		// Lança erro de JWT se o token for inválido ou estiver expirado
		const { login } = await AuthUtils.verifyTokenJWT(token)

		if (!login) {
			throw new AppError(401, 'Invalid token.')
		}

		const userId = await getUserId(login)

		// Token válido de um usuário que não existe mais
		if (!userId) {
			throw new AppError(401, 'Invalid token.')
		}

		// Dados do usuário disponíveis para as rotas protegidas e para o filtro por usuário
		req.user = login
		const storage = await getStorage()
		storage.userLogin = login
		storage.userId = userId

		next()

	} catch (error) {

		return res.error(401, error, 'Not authorized')
	}

};
