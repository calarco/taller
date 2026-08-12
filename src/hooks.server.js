import { redirect } from '@sveltejs/kit';
import { initDatabase } from '$lib/server/db';
import { authenticate } from '$lib/server/controllers/User.controller';

export async function init() {
	await initDatabase();
}

export async function handle({ event, resolve }) {
	const auth = authenticate(event.cookies);
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
	return response;
}

export function handleError({ error, event }) {
	console.error(`[${event.request.method} ${event.url.pathname}]`, error);
	return { message: error?.toString() || 'Error' };
}
