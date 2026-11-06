import { logError } from "../../utils/logger.js"

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
		// const reqDate = new Date()
		// console.log(`${reqDate.toISOString()}|` );

		res.status(200).json({
			status: 200,
			message,
			data,
			error: null,
		});
	};


	/**
	 *
	 * @param {number} status Código de status HTTP
	 * @param {object} error Objeto de erro obtido no Catch()
	 * @param {string} errorTitle Mensagem do erro apresentado
	 */
	res.error = (status = 500, error, errorTitle = 'Internal error.') => {

		logError(`Error on route ${actualRoute}`, error)

		res.status(status).json({
			status,
			message: error.message,
			// date: reqDate.toISOString(),
			error: errorTitle,
		});
	};

	next();
};

