import { error } from '@sveltejs/kit';
import { sharedActions } from '$lib/server/actions.js';
import { handleServerError } from '$lib/server/errors.js';
import { deleteClientAction } from '$lib/server/controllers/Client.controller.js';
import { findVehicle, upsertVehicleAction, deleteVehicleAction } from '$lib/server/controllers/Vehicle.controller.js';
import { findRepairs, upsertRepairAction, deleteRepairAction } from '$lib/server/controllers/Repair.controller.js';

export const load = async (event) => {
	const userId = event.locals.userId;
	const vehicleId = event.params.vehicleId;
	if (!userId || !vehicleId) {
		return;
	}

	try {
		const [vehicle, repairs] = await Promise.all([findVehicle(userId, { vehicleId }, { vehicleId: 1 }), findRepairs(userId, { vehicleId }).sort({ date: -1, updatedAt: -1 })]);
		if (!vehicle) {
			throw error(404, 'Vehículo no encontrado');
		}

		return { repairs: structuredClone(repairs) };
	} catch (err) {
		handleServerError(err, 'vehicleId page load');
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
