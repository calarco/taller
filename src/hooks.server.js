import { redirect } from '@sveltejs/kit';
import { initDatabase } from '$lib/server/db';
import { authenticate } from '$lib/server/controllers/User.controller';

export async function init() {
	await initDatabase();
}

export async function handle({ event, resolve }) {
	const auth = await authenticate(event.cookies);

	if (!auth?.userId) {
		event.cookies.delete('auth-token', { path: '/' });

		if (event.url.pathname !== '/login') {
			throw redirect(307, '/login');
		}
	} else {
		event.locals.userId = auth.userId;

		if (event.url.pathname === '/login') {
			throw redirect(307, '/');
		}
	}

	const response = await resolve(event);
	response.headers.set('x-content-type-options', 'nosniff');
	response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
	response.headers.set('x-frame-options', 'DENY');
	if (event.locals.userId) {
		response.headers.set('cache-control', 'no-store');
	}
	return response;
}

export function handleError({ error, event }) {
	console.error(`[${event.request.method} ${event.url.pathname}]`, error);
	return { message: 'Error interno del servidor' };
}
