import { error } from '@sveltejs/kit';
import { render } from 'svelte/server';
import { sharedActions } from '$lib/server/actions.js';
import { findEstimate, deleteEstimateAction, sendEstimateAction } from '$lib/server/controllers/Estimate.controller.js';
import { findUser } from '$lib/server/controllers/User.controller.js';
import Estimate from '$lib/components/estimate/Estimate.svelte';

export const load = async (event) => {
	const userId = event.locals.userId;
	const estimateId = event.params.estimateId;
	if (!userId || !estimateId) {
		return;
	}

	try {
		const [estimate, user] = await Promise.all([findEstimate(userId, { estimateId }).populate({ path: 'carModel', populate: { path: 'carMake' } }), findUser(userId, { userId })]);
		if (!estimate) {
			throw error(500, 'Presupuesto no encontrado');
		}
		if (!user) {
			throw error(500, 'Usuario no encontrado');
		}
		delete user.password;
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
	...sharedActions,
	deleteEstimate: async (event) => {
		return await deleteEstimateAction(event);
	},
	sendEstimate: async (event) => {
		return await sendEstimateAction(event);
	},
};
