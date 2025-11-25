import { editUserAction } from '$lib/server/controllers/User.controller.js';
import { upsertClientAction } from '$lib/server/controllers/Client.controller.js';
import { createCarMakeAction } from '$lib/server/controllers/CarMake.controller.js';
import { createCarModelAction } from '$lib/server/controllers/CarModel.controller.js';
import { createAppointmentAction, deleteAppointmentAction } from '$lib/server/controllers/Appointment.controller.js';
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
	createAppointment: async (event) => {
		return await createAppointmentAction(event);
	},
	deleteAppointment: async (event) => {
		return await deleteAppointmentAction(event);
	},
	upsertEstimate: async (event) => {
		return await upsertEstimateAction(event);
	},
};
