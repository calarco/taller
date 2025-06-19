import { error, json } from '@sveltejs/kit';
import { getSearch } from '$lib/server/controllers/Util.controller.js';

export const GET = async (event) => {
	const userId = event.cookies.get('userId');
	if (!userId) {
		return;
	}

	try {
		const search = await getSearch(userId, event.params.value);
		return json(search);
	} catch (err) {
		throw error(500, err.body || err.toString());
	}
};
