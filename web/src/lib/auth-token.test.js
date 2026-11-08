import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readToken, decodeToken, sessionCookieOptions, safeNextPath } from './auth-token.js'

const NOW = Date.UTC(2026, 10, 7, 12, 0, 0)
const nowSeconds = NOW / 1000

function fakeJwt(payload) {
	const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url')
	return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.assinatura`
}

test('readToken: token válido devolve login e exp', () => {
	const token = fakeJwt({ login: 'wrne', iat: nowSeconds, exp: nowSeconds + 3600 })
	assert.deepEqual(readToken(token, NOW), { login: 'wrne', exp: nowSeconds + 3600 })
})

test('readToken: login com acento (UTF-8) é decodificado', () => {
	const token = fakeJwt({ login: 'joão', exp: nowSeconds + 3600 })
	assert.equal(readToken(token, NOW)?.login, 'joão')
})

test('readToken: vencido ou vencendo nos próximos 30s é inválido', () => {
	assert.equal(readToken(fakeJwt({ login: 'a', exp: nowSeconds - 1 }), NOW), null)
	assert.equal(readToken(fakeJwt({ login: 'a', exp: nowSeconds + 30 }), NOW), null)
	assert.notEqual(readToken(fakeJwt({ login: 'a', exp: nowSeconds + 31 }), NOW), null)
})

test('readToken: malformado é inválido', () => {
	for (const token of [undefined, null, '', 'abc', 'a.b', 'a.b.c', 'a.b.c.d', fakeJwt({ exp: nowSeconds + 3600 }), fakeJwt({ login: 'a' }), fakeJwt({ login: 'a', exp: '9999999999' }), 'x'.repeat(5000)]) {
		assert.equal(readToken(token, NOW), null, `readToken(${String(token).slice(0, 20)})`)
	}
})

test('sessionCookieOptions: httpOnly e maxAge igual ao tempo restante do JWT', () => {
	const opts = sessionCookieOptions(nowSeconds + 3600, NOW)
	assert.equal(opts.httpOnly, true)
	assert.equal(opts.sameSite, 'lax')
	assert.equal(opts.path, '/')
	assert.equal(opts.maxAge, 3600)
	assert.equal(sessionCookieOptions(nowSeconds - 10, NOW).maxAge, 0)
})

test('safeNextPath: só aceita caminho interno', () => {
	assert.equal(safeNextPath('/orcamento'), '/orcamento')
	assert.equal(safeNextPath('/orcamento?ano=2026'), '/orcamento?ano=2026')
	for (const bad of [undefined, null, 42, '', 'orcamento', '//evil.com', '/\\evil.com', 'https://evil.com', '/login', '/login?next=/x', '/api/categories', '/a\nb']) {
		assert.equal(safeNextPath(bad), '/', `safeNextPath(${JSON.stringify(bad)})`)
	}
})

test('decodeToken: lê o payload sem olhar a validade (para a renderização)', () => {
	const expired = fakeJwt({ login: 'wrne', exp: nowSeconds - 3600 })
	assert.deepEqual(decodeToken(expired), { login: 'wrne', exp: nowSeconds - 3600 })
	assert.equal(readToken(expired, NOW), null, 'readToken continua recusando o vencido')
	for (const bad of [undefined, '', 'a.b', fakeJwt({ exp: 1 }), fakeJwt({ login: 'a' })]) assert.equal(decodeToken(bad), null)
})
