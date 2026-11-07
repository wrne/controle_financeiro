import rateLimit from 'express-rate-limit'
import { AppError } from '../../utils/app-error.js'

/**
 * Limita tentativas de login: 10 falhas por IP a cada 15 minutos.
 * Logins bem-sucedidos não contam. Atrás de proxy/túnel, defina TRUST_PROXY (ver express.js).
 */
export const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	skipSuccessfulRequests: true,
	standardHeaders: 'draft-7',
	legacyHeaders: false,
	handler: (req, res) => res.error(429, new AppError(429, 'Too many login attempts. Try again later.'), 'Too many requests')
})
