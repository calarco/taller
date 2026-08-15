import { fail } from '@sveltejs/kit';
import { repository, toPlain } from '$lib/server/db';
import { handleServerError } from '$lib/server/errors.js';
import { str } from '$lib/server/validate.js';

const carMakes = repository('CarMake', 'carMakeId');

export const findCarMake = carMakes.find;

export const findCarMakes = carMakes.findMany;

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
		carMake.carMakeId = await carMakes.nextId(userId);

		const data = await carMakes.create(userId, carMake);
		return { carMake: toPlain(data) };
	} catch (err) {
		handleServerError(err, 'createCarMakeAction');
	}
}
