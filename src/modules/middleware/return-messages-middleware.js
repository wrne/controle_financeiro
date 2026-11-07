import { logError } from "../../utils/logger.js"
import { AppError } from "../../utils/app-error.js"

// Erros do PostgreSQL que viram resposta controlada (nunca expomos o SQL ao cliente)
const PG_ERRORS = {
	'23505': { status: 409, message: 'Duplicate record.' },
	'23503': { status: 409, message: 'Record is in use or has an invalid reference.' },
	'22P02': { status: 400, message: 'Invalid identifier or value.' }
}

const JWT_ERRORS = ['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError']

/**
 * Decide o que o cliente pode ver. Só AppError, erros de JWT e erros conhecidos do banco
 * têm mensagem exposta; o resto vira "Internal error." (o detalhe fica no log).
 */
function resolveError(error) {
	if (error instanceof AppError) return { status: error.status, message: error.message }

	const pgCode = error?.cause?.code ?? error?.code
	if (PG_ERRORS[pgCode]) return PG_ERRORS[pgCode]

	if (JWT_ERRORS.includes(error?.name)) return { status: 401, message: 'Invalid or expired token.' }

	return { status: 500, message: 'Internal error.' }
}

/**
 * Middleware para adicionar funções customizadas ao objeto `res`. Ele vai adicionar as funções `success` e `error` ao objeto `res` para padronizar o objeto de retorno da requisição. 
 * @param {import('express').Request} req - Objeto de solicitação HTTP.
 * @param {import('express').Response} res - Objeto de resposta HTTP.
 * @param {import('express').NextFunction} next - Função para chamar o próximo middleware.
 */
export default function responseFormatter(req, res, next) {
	const actualRoute = req.originalUrl

	/**
	 * Envia uma resposta de sucesso.
	 * @param {any} data - Dados da resposta.
	 * @param {string} [message='Sucesso'] - Mensagem opcional.
	 */
	res.success = (data, message = 'Success') => {
		res.status(200).json({
			status: 200,
			message,
			data,
			error: null,
		})
	}

	/**
	 * Envia uma resposta de erro. O status e a mensagem finais vêm do tipo do erro (ver resolveError);
	 * o parâmetro `status` é mantido por compatibilidade com os controllers.
	 * @param {number} status Código de status HTTP sugerido
	 * @param {object} error Objeto de erro obtido no Catch()
	 * @param {string} errorTitle Título do erro apresentado
	 */
	res.error = (status = 500, error, errorTitle = 'Internal error.') => {
		logError(`Error on route ${actualRoute}`, error)

		const resolved = resolveError(error)

		res.status(resolved.status).json({
			status: resolved.status,
			message: resolved.message,
			error: errorTitle,
		})
	}

	next()
}
