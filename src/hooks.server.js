import { redirect } from '@sveltejs/kit';
import { initDatabase } from '$lib/server/db';
import { authenticate } from '$lib/server/controllers/User.controller';

export async function init() {
	await initDatabase();
}

export async function handle({ event, resolve }) {
	if (!authenticate(event.cookies)) {
		event.cookies.delete('auth-token', { path: '/' });
		event.cookies.delete('userId', { path: '/' });

		if (event.url.pathname !== '/login') {
			throw redirect(307, '/login');
		}
	} else if (event.url.pathname === '/login') {
		throw redirect(307, '/');
	}

	const response = await resolve(event);
	return response;
}
