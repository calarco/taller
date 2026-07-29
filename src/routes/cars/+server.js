import { error, json } from '@sveltejs/kit';
import { findCarMakes } from '$lib/server/controllers/CarMake.controller.js';
import { findCarModels } from '$lib/server/controllers/CarModel.controller.js';

export const GET = async (event) => {
	const userId = event.locals.userId;
	if (!userId) {
		return json({ carMakes: [], carModels: [] });
	}

	try {
		const [carMakes, carModels] = await Promise.all([findCarMakes(userId).sort({ name: 1 }), findCarModels(userId).sort({ name: 1 })]);
		return json({ carMakes, carModels });
	} catch (err) {
		throw error(500, err.body || err.toString());
	}
};
