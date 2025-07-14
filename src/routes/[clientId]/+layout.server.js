import { error } from '@sveltejs/kit';
import { findClient } from '$lib/server/controllers/Client.controller.js';
import { findVehicles } from '$lib/server/controllers/Vehicle.controller.js';

export const load = async (event) => {
	const userId = event.cookies.get('userId');
	const clientId = event.params.clientId;
	if (!userId || !clientId) {
		return;
	}

	try {
		const client = await findClient(userId, { clientId });
		if (!client) {
			throw error(500, 'Cliente no encontrado');
		}
		const vehicles = await findVehicles(userId, { clientId }).sort({ updatedAt: -1 }).populate({ path: 'carModel', populate: { path: 'carMake', select: 'name' }, select: 'name carMakeId' });
		return { client: structuredClone(client), vehicles: structuredClone(vehicles) };
	} catch (err) {
		throw error(500, err.body || err.toString());
	}
};
