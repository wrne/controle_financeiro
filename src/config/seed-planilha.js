// Carga inicial de grupos, categorias e orçado de um ano para um login.
// Uso: npm run seed -- <login> [arquivo-categorias] [arquivo-orcamento]
// Padrão: dados/categorias-iniciais.json e dados/orcamento-2026.json (fora do git: dados pessoais).
// Recusa a carga se o login já tiver grupos, para não duplicar.
import 'dotenv/config'
import fs from 'node:fs'
import { eq } from 'drizzle-orm'
import { db } from '../infra/db/database-connection.js'
import { users, categoryGroups, categories, budgetItems } from '../infra/db/schemas.js'
import { buildSeedPlan } from './seed-plan.js'

function readJson(path) {
	if (!fs.existsSync(path)) throw new Error(`File not found: ${path}`)
	return JSON.parse(fs.readFileSync(path, 'utf8'))
}

async function seed() {
	const login = process.argv[2]?.trim().toLowerCase()
	const categoriesPath = process.argv[3] ?? 'dados/categorias-iniciais.json'
	const budgetPath = process.argv[4] ?? 'dados/orcamento-2026.json'
	if (!login) throw new Error('Usage: npm run seed -- <login> [categories.json] [budget.json]')

	const plan = buildSeedPlan(readJson(categoriesPath), fs.existsSync(budgetPath) ? readJson(budgetPath) : null)

	const [user] = await db.select({ id: users.id }).from(users).where(eq(users.login, login))
	if (!user) throw new Error(`User "${login}" not found.`)

	const existing = await db.select({ id: categoryGroups.id }).from(categoryGroups).where(eq(categoryGroups.userId, user.id)).limit(1)
	if (existing.length) throw new Error(`User "${login}" already has category groups; seed refused to avoid duplicates.`)

	const summary = await db.transaction(async (tx) => {
		const categoryIds = new Map()
		let categoryCount = 0

		for (const group of plan.groups) {
			const [row] = await tx.insert(categoryGroups).values({
				userId: user.id, name: group.name, kind: group.kind, resultClass: group.resultClass, sortOrder: group.sortOrder
			}).returning({ id: categoryGroups.id })

			if (group.categories.length) {
				const inserted = await tx.insert(categories).values(group.categories.map((c) => ({
					userId: user.id, groupId: row.id, name: c.name, sortOrder: c.sortOrder
				}))).returning({ id: categories.id, name: categories.name })
				for (const c of inserted) categoryIds.set(`${group.name}\u0000${c.name}`, c.id)
				categoryCount += inserted.length
			}
		}

		if (plan.items.length) {
			await tx.insert(budgetItems).values(plan.items.map((it) => ({
				userId: user.id,
				categoryId: categoryIds.get(`${it.group}\u0000${it.category}`),
				year: plan.year,
				month: it.month,
				amountCents: it.amountCents
			})))
		}

		return { groups: plan.groups.length, categories: categoryCount, items: plan.items.length }
	})

	console.log(`Seed done for "${login}": ${summary.groups} groups, ${summary.categories} categories, ${summary.items} budget items${plan.year ? ` (${plan.year})` : ''}.`)
}

seed()
	.catch((error) => {
		console.error(error.message)
		process.exitCode = 1
	})
	.finally(() => db.$client.end())
