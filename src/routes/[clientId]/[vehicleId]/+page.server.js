import { error } from '@sveltejs/kit';
import { sharedActions } from '$lib/server/actions.js';
import { deleteClientAction } from '$lib/server/controllers/Client.controller.js';
import { upsertVehicleAction, deleteVehicleAction } from '$lib/server/controllers/Vehicle.controller.js';
import { findRepairs, upsertRepairAction, deleteRepairAction } from '$lib/server/controllers/Repair.controller.js';

export const load = async (event) => {
	const userId = event.locals.userId;
	const vehicleId = event.params.vehicleId;
	if (!userId || !vehicleId) {
		return;
	}

	try {
		const [{ vehicles }, repairs] = await Promise.all([event.parent(), findRepairs(userId, { vehicleId }).sort({ date: -1, updatedAt: -1 })]);
		const vehicle = vehicles?.find((x) => x.vehicleId === vehicleId);
		if (!vehicle) {
			throw error(500, 'Vehiculo no encontrado');
		}

		return { vehicle: structuredClone(vehicle), repairs: structuredClone(repairs) };
	} catch (err) {
		throw error(500, err.body || err.toString());
	}
};

export const actions = {
	...sharedActions,
	deleteClient: async (event) => {
		return await deleteClientAction(event);
	},
	upsertVehicle: async (event) => {
		return await upsertVehicleAction(event);
	},
	deleteVehicle: async (event) => {
		return await deleteVehicleAction(event);
	},
	upsertRepair: async (event) => {
		return await upsertRepairAction(event);
	},
	deleteRepair: async (event) => {
		return await deleteRepairAction(event);
	},
};
