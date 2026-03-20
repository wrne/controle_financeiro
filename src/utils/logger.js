import fs from 'fs';
import path from 'path';
import { getStorage } from './context-utils.js';

/**
 * Cria uma entrada de log formatada e grava no arquivo de log do sistema correspondente.
 * @param {String} message texto a ser gravado no log
 * @param {String} level define o nivel do log: debug, info, warning, error, etc
 */
async function log(message, level = 'info') {
	const store = await getStorage();
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

	const filePath = `${process.env.LOG_PATH}/${system}_${dateForLog}${queue ? '_wh' : ''}.log`;
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.appendFileSync(filePath, line + '\n');

}

export async function logError(errorMessage, error) {

	await log(`errorMessage: ${errorMessage}\n${(!!error.cause ? `Details: ${error.cause}\n` : '')}Stack:${error.stack}`, 'error');

}

export async function logInfo(message) {

	await log(message, 'info');

}

export async function logDebug(message) {

	await log(message, 'debug');

}

export async function logWarn(message) {

	await log(message, 'warn');

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