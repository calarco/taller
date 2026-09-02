import { json } from '@sveltejs/kit';
import { handleServerError } from '$lib/server/errors.js';
import { toNumber } from '$lib/server/validate.js';
import { getSearch } from '$lib/server/controllers/Search.controller.js';

export const GET = async (event) => {
	const userId = event.locals.userId;
	if (!userId) {
		return json([]);
	}

	try {
		const search = await getSearch(userId, event.url.searchParams.get('q') || '', event.url.searchParams.get('type') || '', toNumber(event.url.searchParams.get('limit')));
		return json(search);
	} catch (err) {
		handleServerError(err, 'search endpoint');
	}
};
