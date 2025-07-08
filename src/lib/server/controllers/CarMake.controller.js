import { error, fail } from '@sveltejs/kit';
import { getModel } from '$lib/server/db';

export function findCarMake(userId, filters) {
	const CarMake = getModel(userId, 'CarMake');
	return CarMake.findOne(filters, { __v: 0, _id: 0 }).lean();
}

export function findCarMakes(userId, filters) {
	const CarMake = getModel(userId, 'CarMake');
	return CarMake.find(filters, { __v: 0, _id: 0 }).lean();
}

async function getNewId(userId) {
	let max = 1;
	const carMake = await findCarMake(userId, {}, { carMakeId: 1 }).sort({ carMakeId: -1 }).collation({ locale: 'en_US', numericOrdering: true });
	if (carMake?.carMakeId) {
		max = Number(carMake.carMakeId) + 1;
	}
	return String(max);
}

export async function createCarMakeAction(event) {
	try {
		const userId = event.cookies.get('userId');
		if (!userId) {
			return;
		}

		const form = await event.request.formData();
		const carMake = {
			carMakeId: await getNewId(userId),
			name: (form.get('name') || '').trim(),
		};

		if (!carMake.name) {
			return fail(400, { carMakeError: 'Ingrese la marca' });
		}
		const existing = await findCarMake(userId, { name: carMake.name });
		if (existing) {
			return fail(400, { carMakeError: 'La marca ya existe' });
		}

		const CarMake = getModel(userId, 'CarMake');
		const data = await CarMake.create(carMake);
		return { carMake: JSON.parse(JSON.stringify(data)) };
	} catch (err) {
		throw error(500, err.body || err.toString());
	}
}
