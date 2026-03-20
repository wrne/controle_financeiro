import AuthUtils from "../../utils/auth-utils.js"
import { getStorage } from "../../utils/context-utils.js";
import { getUserId } from "../../services/user-services.js";
import {logInfo} from "../../utils/logger.js";

/**
 * Middleware de autenticação que verifica se o token JWT enviado na requisição é válido
 */
export default async function authMiddleware(req, res, next) {

	console.log(`Request URL: ${req.originalUrl}`)
	console.log(`Request Method: ${req.method}`)
	// console.log(`Request Header: ${req.headers.authorization}`)

	// Verifica se o cabeçalho Authorization existe
	const authHeader = req.headers.authorization

	try {

		if (!authHeader) {
			throw new Error("Autentication Token not supplied")
		}


	} catch (error) {

		return res.error(401, error, 'Not autorized');

	}

	// Extraindo o token (formato esperado: "Bearer <token>")
	const token = authHeader.split(' ')[1]

	try {

		const {login} = await AuthUtils.verifyTokenJWT(token)

		// Verificando a validade do token
		if (!!login) {
			// Adiciona os dados do usuário ao objeto `req` para uso em rotas protegidas
			req.user = login;
			const userId = await getUserId(login);
			const storage = await getStorage();
			storage.userLogin = login // Armazena o login do usuário no contexto de armazenamento
			storage.userId = userId // Armazena o ID do usuário no contexto de armazenamento
			next(); // Passa o controle para a próxima função ou rota

		} else {

			throw new Error('token validation failed');
		}

	} catch (error) {

		return res.error(401, error, 'Not autorized');
	}

};