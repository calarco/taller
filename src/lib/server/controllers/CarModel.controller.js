import { error, fail } from '@sveltejs/kit';
import { getModel } from '$lib/server/db';

async function getNewId(userId) {
	let max = 1;
	const carModel = await findCarModel(userId, {}, { carModelId: 1 }).sort({ carModelId: -1 }).collation({ locale: 'en_US', numericOrdering: true });
	if (carModel?.carModelId) {
		max = Number(carModel.carModelId) + 1;
	}
	if (isNaN(max)) {
		throw error(500, 'ID invalida');
	}
	return String(max);
}

export function findCarModel(userId, filters) {
	const CarModel = getModel(userId, 'CarModel');
	return CarModel.findOne(filters, { __v: 0, _id: 0 }).lean();
}

export function findCarModels(userId, filters) {
	const CarModel = getModel(userId, 'CarModel');
	return CarModel.find(filters, { __v: 0, _id: 0 }).lean();
}

export async function createCarModel(userId, carModel) {
	const existing = await findCarModel(userId, { carMakeId: carModel.carMakeId, name: carModel.name });
	if (existing) {
		return fail(400, { carModelError: 'El modelo ya existe' });
	}
	if (!carModel.carModelId) {
		carModel.carModelId = await getNewId(userId);
	}
	const CarModel = getModel(userId, 'CarModel');
	return CarModel.create(carModel);
}

export async function createCarModelAction(event) {
	try {
		const userId = event.cookies.get('userId');
		if (!userId) {
			return;
		}

		const form = await event.request.formData();
		const carModel = {
			carMakeId: form.get('carMakeId'),
			name: (form.get('name') || '').trim(),
		};

		if (!carModel.carMakeId) {
			return fail(400, { carMakeError: 'Ingrese la marca' });
		}
		if (!carModel.name) {
			return fail(400, { carModelError: 'Ingrese el modelo' });
		}

		const data = await createCarModel(userId, carModel);
		return { carModel: JSON.parse(JSON.stringify(data)) };
	} catch (err) {
		throw error(500, err.body || err.toString());
	}
}
