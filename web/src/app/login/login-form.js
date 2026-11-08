'use client'

import { useActionState } from 'react'
import { login } from './actions'

export function LoginForm({ next, expired }) {
	const [state, formAction, pending] = useActionState(login, { error: null, login: '' })

	return (
		<form action={formAction} className="flex flex-col gap-4">
			<input type="hidden" name="next" value={next} />

			{expired && !state.error && (
				<p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
					Sua sessão expirou. Entre de novo.
				</p>
			)}
			{state.error && (
				<p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-100">
					{state.error}
				</p>
			)}

			<label className="flex flex-col gap-1 text-sm font-medium">
				Login
				<input
					name="login"
					autoComplete="username"
					autoCapitalize="none"
					defaultValue={state.login}
					required
					maxLength={50}
					className="rounded-md border border-line bg-surface px-3 py-2 text-base font-normal"
				/>
			</label>

			<label className="flex flex-col gap-1 text-sm font-medium">
				Senha
				<input
					name="password"
					type="password"
					autoComplete="current-password"
					required
					maxLength={128}
					className="rounded-md border border-line bg-surface px-3 py-2 text-base font-normal"
				/>
			</label>

			<button
				type="submit"
				disabled={pending}
				className="rounded-md bg-accent px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-60"
			>
				{pending ? 'Entrando…' : 'Entrar'}
			</button>
		</form>
	)
}
