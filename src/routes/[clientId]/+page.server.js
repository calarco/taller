import { sharedActions } from '$lib/server/actions.js';
import { deleteClientAction } from '$lib/server/controllers/Client.controller.js';
import { upsertVehicleAction } from '$lib/server/controllers/Vehicle.controller.js';

export const actions = {
	...sharedActions,
	deleteClient: deleteClientAction,
	upsertVehicle: upsertVehicleAction,
};
