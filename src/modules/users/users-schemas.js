import { z } from 'zod'

export const loginSchema = z.object({
	login: z.string().trim().toLowerCase().min(1).max(50),
	password: z.string().min(1).max(128)
})

export const newUserSchema = z.object({
	login: z.string().trim().toLowerCase().min(3).max(50)
		.regex(/^[a-z0-9._-]+$/, 'only letters, numbers, dot, underscore and hyphen'),
	name: z.string().trim().min(1).max(50),
	password: z.string().min(8, 'must have at least 8 characters').max(128),
	role: z.enum(['admin', 'user']).default('user')
})
