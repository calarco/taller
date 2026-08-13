import { fail } from '@sveltejs/kit';
import { getModel, repository, toPlain } from '$lib/server/db';
import { handleServerError } from '$lib/server/errors.js';
import { str } from '$lib/server/validate.js';

const carModels = repository('CarModel', 'carModelId');

export const carModelPopulate = {
	path: 'carModel',
	select: 'carModelId name carMakeId -_id',
	populate: { path: 'carMake', select: 'carMakeId name -_id' },
};

export const findCarModel = carModels.find;
export const findCarModels = carModels.findMany;

export async function createCarModel(userId, carModel) {
	const existing = await findCarModel(userId, { carMakeId: carModel.carMakeId, name: carModel.name });
	if (existing) {
		return existing;
	}
	if (!carModel.carModelId) {
		carModel.carModelId = await carModels.nextId(userId);
	}
	const CarModel = getModel(userId, 'CarModel');
	return CarModel.create(carModel);
}

export async function createCarModelAction(event) {
	try {
		const userId = event.locals.userId;
		if (!userId) {
			return;
		}

		const form = await event.request.formData();
		const carModel = {
			carMakeId: str(form.get('carMakeId')),
			name: str(form.get('name')),
		};

		if (!carModel.carMakeId) {
			return fail(400, { carMakeError: 'Ingrese la marca' });
		}
		if (!carModel.name) {
			return fail(400, { carModelError: 'Ingrese el modelo' });
		}

		const existing = await findCarModel(userId, { carMakeId: carModel.carMakeId, name: carModel.name });
		if (existing) {
			return fail(400, { carModelError: 'El modelo ya existe' });
		}

		const data = await createCarModel(userId, carModel);
		return { carModel: toPlain(data) };
	} catch (err) {
		handleServerError(err, 'createCarModelAction');
	}
}
