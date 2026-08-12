import { error, isHttpError, isRedirect } from '@sveltejs/kit';

export function handleServerError(err, context) {
	if (isRedirect(err) || isHttpError(err)) {
		throw err;
	}
	console.error(`[${context}]`, err);
	throw error(500, 'Error interno del servidor');
}
