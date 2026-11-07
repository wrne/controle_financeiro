// Troca a senha de um usuário pelo terminal.
// Uso: npm run set-password -- <login>
// A senha é pedida de forma oculta (não vai para argumentos, histórico do shell nem log).
import 'dotenv/config'
import readline from 'node:readline'
import { eq } from 'drizzle-orm'
import { db } from '../infra/db/database-connection.js'
import { users } from '../infra/db/schemas.js'
import AuthUtils from '../utils/auth-utils.js'

function askHidden(question) {
	return new Promise((resolve) => {
		const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
		let muted = false
		rl._writeToOutput = (text) => {
			if (!muted || text === '\n' || text === '\r\n') rl.output.write(text)
		}
		rl.question(question, (answer) => {
			rl.output.write('\n')
			rl.close()
			resolve(answer)
		})
		muted = true
	})
}

async function setPassword() {
	if (!process.env.DATABASE_URL) {
		throw new Error('DATABASE_URL is not configured.')
	}
	if (!process.stdin.isTTY) {
		throw new Error('Run this script in an interactive terminal.')
	}

	const login = process.argv[2]?.trim().toLowerCase()
	if (!login) {
		throw new Error('Usage: npm run set-password -- <login>')
	}

	const [user] = await db.select({ id: users.id }).from(users).where(eq(users.login, login))
	if (!user) {
		throw new Error(`User "${login}" not found.`)
	}

	const password = await askHidden(`Nova senha para "${login}": `)
	if (password.length < 8 || password.length > 128) {
		throw new Error('Password must have between 8 and 128 characters.')
	}
	const confirmation = await askHidden('Repita a senha: ')
	if (password !== confirmation) {
		throw new Error('Passwords do not match.')
	}

	const { salt, hash } = AuthUtils.buildHashPwdAndSalt(password)
	await db.update(users)
		.set({ password: `${hash}:${salt}`, updatedAt: new Date() })
		.where(eq(users.id, user.id))

	console.log(`Password of "${login}" updated.`)
}

setPassword()
	.catch((error) => {
		console.error(error.message)
		process.exitCode = 1
	})
	.finally(() => db.$client.end())
