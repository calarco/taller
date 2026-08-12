import { redirect } from '@sveltejs/kit';
import { editUserAction } from '$lib/server/controllers/User.controller.js';
import { upsertClientAction } from '$lib/server/controllers/Client.controller.js';
import { createCarMakeAction } from '$lib/server/controllers/CarMake.controller.js';
import { createCarModelAction } from '$lib/server/controllers/CarModel.controller.js';
import { createAppointmentAction, deleteAppointmentAction } from '$lib/server/controllers/Appointment.controller.js';
import { upsertEstimateAction } from '$lib/server/controllers/Estimate.controller.js';
import { resetDemo } from '$lib/server/controllers/Demo.controller.js';

export const sharedActions = {
	editUser: editUserAction,
	logout: async (event) => {
		event.cookies.delete('auth-token', { path: '/' });
		throw redirect(307, '/login');
	},
	createCarMake: createCarMakeAction,
	createCarModel: createCarModelAction,
	upsertClient: upsertClientAction,
	createAppointment: createAppointmentAction,
	deleteAppointment: deleteAppointmentAction,
	upsertEstimate: upsertEstimateAction,
};
