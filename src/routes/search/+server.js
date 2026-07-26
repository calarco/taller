import { error, json } from '@sveltejs/kit';
import { getSearch } from '$lib/server/controllers/Search.controller.js';

export const GET = async (event) => {
	const userId = event.cookies.get('userId');
	if (!userId) {
		return json([]);
	}

	try {
		const search = await getSearch(userId, event.url.searchParams.get('q') || '', event.url.searchParams.get('type') || '');
		return json(search);
	} catch (err) {
		throw error(500, err.body || err.toString());
	}
};
