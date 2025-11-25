import { error } from '@sveltejs/kit';
import { render } from 'svelte/server';
import { findUser, editUserAction } from '$lib/server/controllers/User.controller.js';
import { upsertClientAction } from '$lib/server/controllers/Client.controller.js';
import { createCarMakeAction } from '$lib/server/controllers/CarMake.controller.js';
import { createCarModelAction } from '$lib/server/controllers/CarModel.controller.js';
import { createAppointmentAction, deleteAppointmentAction } from '$lib/server/controllers/Appointment.controller.js';
import { findEstimate, upsertEstimateAction, deleteEstimateAction, sendEstimateAction } from '$lib/server/controllers/Estimate.controller.js';
import Estimate from '$lib/components/estimate/Estimate.svelte';

export const load = async (event) => {
	const userId = event.cookies.get('userId');
	const estimateId = event.params.estimateId;
	if (!userId || !estimateId) {
		return;
	}

	try {
		const [estimate, user] = await Promise.all([
			findEstimate(userId, { estimateId }).populate({ path: 'carModel', populate: { path: 'carMake' } }),
			findUser(userId, { userId }),
		]);
		if (!estimate) {
			throw error(500, 'Presupuesto no encontrado');
		}
		if (!user) {
			throw error(500, 'Usuario no encontrado');
		}
		const rendered = await render(Estimate, { props: { estimate, user } });
		if (!rendered?.html) {
			throw error(500, 'Presupuesto no renderizado');
		}

		return { estimate: structuredClone(estimate), html: rendered.html };
	} catch (err) {
		throw error(500, err.body || err.toString());
	}
};

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
	deleteEstimate: async (event) => {
		return await deleteEstimateAction(event);
	},
	sendEstimate: async (event) => {
		return await sendEstimateAction(event);
	},
};
