import { error } from '@sveltejs/kit';
import { handleServerError } from '$lib/server/errors.js';
import { findClient } from '$lib/server/controllers/Client.controller.js';
import { findVehicles } from '$lib/server/controllers/Vehicle.controller.js';

export const load = async (event) => {
	const userId = event.locals.userId;
	const clientId = event.params.clientId;
	if (!userId || !clientId) {
		return;
	}

	try {
		const [client, vehicles] = await Promise.all([
			findClient(userId, { clientId }),
			findVehicles(userId, { clientId })
				.sort({ updatedAt: -1 })
				.populate({ path: 'carModel', populate: { path: 'carMake', select: 'name' }, select: 'name carMakeId' }),
		]);
		if (!client) {
			throw error(404, 'Cliente no encontrado');
		}
		return { client: structuredClone(client), vehicles: structuredClone(vehicles) };
	} catch (err) {
		handleServerError(err, 'clientId layout load');
	}
};
