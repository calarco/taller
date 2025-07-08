import { error } from '@sveltejs/kit';
import { switchThemeAction, editUserAction } from '$lib/server/controllers/User.controller.js';
import { createCarMakeAction } from '$lib/server/controllers/CarMake.controller.js';
import { createCarModelAction } from '$lib/server/controllers/CarModel.controller.js';
import { upsertClientAction, deleteClientAction } from '$lib/server/controllers/Client.controller.js';
import { findVehicle, upsertVehicleAction, deleteVehicleAction } from '$lib/server/controllers/Vehicle.controller.js';
import { findRepairs, upsertRepairAction, deleteRepairAction } from '$lib/server/controllers/Repair.controller.js';
import { upsertEstimateAction } from '$lib/server/controllers/Estimate.controller.js';

export const load = async (event) => {
	const userId = event.cookies.get('userId');
	const vehicleId = event.params.vehicleId;
	if (!userId || !vehicleId) {
		return;
	}

	try {
		const vehicle = await findVehicle(userId, { vehicleId });
		if (!vehicle) {
			throw error(500, 'Vehiculo no encontrado');
		}

		const repairs = await findRepairs(userId, { vehicleId }).sort({ date: -1, updatedAt: -1 });
		return { vehicle: structuredClone(vehicle), repairs: structuredClone(repairs) };
	} catch (err) {
		throw error(500, err.body || err.toString());
	}
};

export const actions = {
	switchTheme: async (event) => {
		return await switchThemeAction(event);
	},
	editUser: async (event) => {
		return await editUserAction(event);
	},
	logout: async (event) => {
		event.cookies.delete('auth-token', { path: '/' });
		event.cookies.delete('userId', { path: '/' });
		return;
	},
	createCarMake: async (event) => {
		return await createCarMakeAction(event);
	},
	createCarModel: async (event) => {
		return await createCarModelAction(event);
	},
	upsertClient: async (event) => {
		return await upsertClientAction(event);
	},
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
	upsertEstimate: async (event) => {
		return await upsertEstimateAction(event);
	},
};
