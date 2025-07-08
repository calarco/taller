import { render } from 'svelte/server';
import nodemailer from 'nodemailer';
import { error, fail, redirect, isRedirect } from '@sveltejs/kit';
import { MAIL_USER, MAIL_PASS } from '$env/static/private';
import { getModel } from '$lib/server/db';
import { findUser } from '$lib/server/controllers/User.controller.js';
import { createCarModel } from '$lib/server/controllers/CarModel.controller.js';
import Estimate from '$lib/components/estimate/Estimate.svelte';

export function findEstimate(userId, filters) {
	const Estimate = getModel(userId, 'Estimate');
	return Estimate.findOne(filters, { __v: 0, _id: 0 }).lean();
}

export function findEstimates(userId, filters) {
	const Estimate = getModel(userId, 'Estimate');
	return Estimate.find(filters, { __v: 0, _id: 0 }).lean();
}

export function upsertEstimate(userId, estimate) {
	const Estimate = getModel(userId, 'Estimate');
	return Estimate.findOneAndUpdate({ estimateId: estimate.estimateId }, estimate, { new: true, upsert: true });
}

async function getNewId(userId) {
	let max = 1;
	const estimate = await findEstimate(userId, {}, { estimateId: 1 }).sort({ estimateId: -1 }).collation({ locale: 'en_US', numericOrdering: true });
	if (estimate?.estimateId) {
		max = Number(estimate.estimateId) + 1;
	}
	return String(max);
}

export async function upsertEstimateAction(event) {
	try {
		const userId = event.cookies.get('userId');
		if (!userId) {
			return;
		}

		const form = await event.request.formData();
		const estimate = {
			estimateId: form.get('estimateId'),
			vehicleId: (form.get('vehicleId') || '').replace(/\s+/g, '').toUpperCase(),
			carMakeId: form.get('carMakeId'),
			carModelId: form.get('carModelId'),
			carModelName: form.get('carModelName'),
			km: form.get('km'),
			description: form.get('description'),
			labor: form.get('labor'),
			parts: form.getAll('part'),
		};
		if (estimate.parts?.length) {
			estimate.parts = estimate.parts.map((x) => JSON.parse(x));
		}

		if (!estimate.estimateId) {
			estimate.estimateId = await getNewId(userId);
		}
		if (!estimate.vehicleId) {
			return fail(400, { vehicleIdError: 'Ingrese la patente' });
		}
		if (!estimate.description) {
			return fail(400, { descriptionError: 'Ingrese una descripción' });
		}
		if (estimate.carModelName && estimate.carMakeId && !estimate.carModelId) {
			const carModel = await createCarModel(userId, { carMakeId: estimate.carMakeId, name: estimate.carModelName });
			estimate.carModelId = carModel.carModelId;
		}

		const data = await upsertEstimate(userId, estimate);
		if (data.estimateId) {
			throw redirect(307, `/estimate/${data.estimateId}`);
		}
		return { data: JSON.parse(JSON.stringify(data)) };
	} catch (err) {
		if (isRedirect(err)) {
			throw err;
		}
		throw error(500, err.body || err.toString());
	}
}

export async function deleteEstimateAction(event) {
	try {
		const userId = event.cookies.get('userId');
		if (!userId) {
			return;
		}

		const form = await event.request.formData();
		const estimateId = form.get('estimateId');
		if (!estimateId) {
			throw error(400, 'Missing id');
		}

		const Estimate = getModel(userId, 'Estimate');
		await Estimate.deleteOne({ estimateId });
		throw redirect(307, '/');
	} catch (err) {
		if (isRedirect(err)) {
			throw err;
		}
		throw error(500, err.body || err.toString());
	}
}

export async function sendEstimateAction(event) {
	try {
		const userId = event.cookies.get('userId');
		if (!userId) {
			return;
		}

		const form = await event.request.formData();
		const estimateId = form.get('estimateId');
		const email = form.get('email');
		if (!estimateId) {
			throw error(400, 'Missing id');
		}
		if (!email) {
			return fail(400, { emailError: 'Ingrese un email' });
		}

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
		const rendered = render(Estimate, { props: { estimate, user } });
		if (!rendered?.html) {
			throw error(500, 'Presupuesto no renderizado');
		}

		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: MAIL_USER,
				pass: MAIL_PASS,
			},
		});
		const data = await transporter.sendMail({
			from: MAIL_USER,
			to: email,
			subject: 'Presupuesto',
			html: rendered.html,
		});
		if (data.accepted[0] === email) {
			await upsertEstimate(userId, { estimateId, email });
		}
		return { data: JSON.parse(JSON.stringify(data)) };
	} catch (err) {
		if (isRedirect(err)) {
			throw err;
		}
		throw error(500, err.body || err.toString());
	}
}
