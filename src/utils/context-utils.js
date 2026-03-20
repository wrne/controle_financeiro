import { AsyncLocalStorage } from 'node:async_hooks';
const asyncLocalStorage = new AsyncLocalStorage();

/**
 * Cria o contexto de logger para requisições Express. DEfine um ID único para cada requisição e extrai o nome do sistema pela URL para separação e organização dos logs.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
export function createExpressLoggerContext(req, res, next) {
	const requestId = crypto.randomUUID().substring(0,8);

	// extrai o nome do sistema pela URL: /abc/... → "abc"
	const systemName = req.path.split('/')[1] || 'unknown';

	asyncLocalStorage.run({ requestId, systemName }, () => next());
}

export async function getStorage(){
	return await asyncLocalStorage.getStore();
}