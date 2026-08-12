import { error, fail } from '@sveltejs/kit';
import { getModel, getNextId } from '$lib/server/db';
import { handleServerError } from '$lib/server/errors.js';
import { str } from '$lib/server/validate.js';

function getNewId(userId) {
	return getNextId(userId, 'carMake', async () => {
		const carMake = await findCarMake(userId, {}, { carMakeId: 1 }).sort({ carMakeId: -1 }).collation({ locale: 'en_US', numericOrdering: true });
		const max = Number(carMake?.carMakeId ?? 0);
		if (isNaN(max)) {
			throw error(500, 'ID invalida');
		}
		return max;
	});
}

export function findCarMake(userId, filters, projection = { __v: 0 }) {
	const CarMake = getModel(userId, 'CarMake');
	return CarMake.findOne(filters, { ...projection, _id: 0 }).lean();
}

export function findCarMakes(userId, filters, projection = { __v: 0 }) {
	const CarMake = getModel(userId, 'CarMake');
	return CarMake.find(filters, { ...projection, _id: 0 }).lean();
}

export async function createCarMakeAction(event) {
	try {
		const userId = event.locals.userId;
		if (!userId) {
			return;
		}

		const form = await event.request.formData();
		const carMake = {
			name: str(form.get('name')),
		};

		if (!carMake.name) {
			return fail(400, { carMakeError: 'Ingrese la marca' });
		}
		const existing = await findCarMake(userId, { name: carMake.name });
		if (existing) {
			return fail(400, { carMakeError: 'La marca ya existe' });
		}
		carMake.carMakeId = await getNewId(userId);

		const CarMake = getModel(userId, 'CarMake');
		const data = await CarMake.create(carMake);
		return { carMake: JSON.parse(JSON.stringify(data)) };
	} catch (err) {
		handleServerError(err, 'createCarMakeAction');
	}
}
