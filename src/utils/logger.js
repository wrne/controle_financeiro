import { AsyncLocalStorage } from 'node:async_hooks';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

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

/**
 * Cria o contexto de logger para processamento de webhooks (workers / RabbitMQ).
 * Cada mensagem processada cria um contexto isolado.
 * @param {Object} params
 * @param {String} params.queueName Nome da fila do RabbitMQ
 * @param {String} [params.systemName] Sistema de origem (opcional)
 * @param {Function} handler Função async que processa a mensagem
 */
export function createWebhookLoggerContext({ queueName, systemName = 'webhook' }, handler) {
	const requestId = crypto.randomUUID().substring(0, 8);

	const context = {
		requestId,
		systemName,
		queueName
	};

	return asyncLocalStorage.run(context, handler);
}

/**
 * Cria uma entrada de log formatada e grava no arquivo de log do sistema correspondente.
 * @param {String} message texto a ser gravado no log
 * @param {String} level define o nivel do log: debug, info, warning, error, etc
 */
function log(message, level = 'info') {
	const store = asyncLocalStorage.getStore();
	const threadId = store?.requestId || 'no-thread';
	const system = store?.systemName || 'general';
	const queue = store?.queueName ? ` - queue:${store.queueName}` : '';
	const line = `[${new Date().toISOString()} - ${system}${queue} - thread:${threadId} - ${level.toUpperCase()}] - ${message}`;
	const dateForLog = `${new Date().getUTCFullYear()}${getWeekNumber(new Date())}` // Log semanal
	// const dateForLog = new Date().toISOString().slice(0,10).replace(/-/g, "") // Log diário

	switch (level) {
		case 'error':
			console.error(line);
			break;
		case 'warn':
			console.warn(line);
			break
		case 'info':
			console.info(line);
			break
		case 'debug':
			console.debug(line);
			break
		default:
			console.log(line);
			break;
	}

	const filePath = `${process.ccab_conecta.log_path}/${system}_${dateForLog}${queue ? '_wh' : ''}.log`;
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.appendFileSync(filePath, line + '\n');

}

export function logError(errorMessage, error) {

	log(`errorMessage: ${errorMessage}\nDetails: ${error.stack}`, 'error');

}

export function logInfo(message) {

	log(message, 'info');

}

export function logDebug(message) {

	log(message, 'debug');

}

export function logWarn(message) {

	log(message, 'warn');

}

/**
 * Calcula o número da semana para uma data específica.
 * @param {Date} d - A data para a qual calcular a semana.
 * @returns {number} O número da semana.
 */
function getWeekNumber(d) {

  const startOfYear = new Date(d.getFullYear(), 0, 1);
  startOfYear.setDate(startOfYear.getDate() + (startOfYear.getDay() % 7));

  return Math.round((d - startOfYear) / 604_800_000).toString().padStart(2, '0');

}