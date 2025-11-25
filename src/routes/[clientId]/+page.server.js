import { editUserAction } from '$lib/server/controllers/User.controller.js';
import { createCarMakeAction } from '$lib/server/controllers/CarMake.controller.js';
import { createCarModelAction } from '$lib/server/controllers/CarModel.controller.js';
import { upsertClientAction, deleteClientAction } from '$lib/server/controllers/Client.controller.js';
import { upsertVehicleAction } from '$lib/server/controllers/Vehicle.controller.js';
import { upsertEstimateAction } from '$lib/server/controllers/Estimate.controller.js';

export const actions = {
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
	upsertEstimate: async (event) => {
		return await upsertEstimateAction(event);
	},
};
