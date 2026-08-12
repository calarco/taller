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
	deleteClient: deleteClientAction,
	upsertVehicle: upsertVehicleAction,
	deleteVehicle: deleteVehicleAction,
	upsertRepair: upsertRepairAction,
	deleteRepair: deleteRepairAction,
};
