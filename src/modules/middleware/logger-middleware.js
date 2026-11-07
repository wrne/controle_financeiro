import {logInfo} from '../../utils/logger.js';

// Campos que nunca podem ser gravados em log
const SENSITIVE_KEYS = new Set(['password', 'senha', 'token', 'authorization', 'secret'])
const MAX_BODY_LOG_LENGTH = 2000

function maskSensitive(value) {
	if (Array.isArray(value)) return value.map(maskSensitive)
	if (value && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value).map(([key, val]) =>
				[key, SENSITIVE_KEYS.has(key.toLowerCase()) ? '***' : maskSensitive(val)])
		)
	}
	return value
}

function bodyForLog(body) {
	const text = JSON.stringify(maskSensitive(body))
	return text && text.length > MAX_BODY_LOG_LENGTH ? `${text.slice(0, MAX_BODY_LOG_LENGTH)}...(truncated)` : text
}

/**
 * Middlweware para logar requisições HTTP.
 * Executado a quando recepciona cada requisição. Antes dos demais middlewares.
 * Campos sensíveis (ex.: password) são mascarados antes de gravar no log.
 * @param {import('express').Request} req - Objeto de solicitação HTTP.
 * @param {import('express').Response} res - Objeto de resposta HTTP.
 * @param {import('express').NextFunction} next - Função para chamar o próximo middleware.
 */
export default function httpReqLogger(req, res, next) {

  logInfo(
`--REQ--------------------------------------------------
Acess: ${req.hostname} ${req.user}
Request: ${req.method} ${req.originalUrl}
Body: ${bodyForLog(req.body)}
--END REQ----------------------------------------------`);
  next();
}
