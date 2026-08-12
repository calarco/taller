import { render } from 'svelte/server';
import nodemailer from 'nodemailer';
import { error, fail, redirect } from '@sveltejs/kit';
import { MAIL_USER, MAIL_PASS } from '$env/static/private';
import { getModel, getNextId } from '$lib/server/db';
import { handleServerError } from '$lib/server/errors.js';
import { str, toNumber } from '$lib/server/validate.js';
import { findUser } from '$lib/server/controllers/User.controller.js';
import { createCarModel } from '$lib/server/controllers/CarModel.controller.js';
import Estimate from '$lib/components/estimate/Estimate.svelte';

function toParts(values) {
	const parts = [];
	for (const value of values) {
		const raw = str(value);
		if (!raw) {
			continue;
		}

		let parsed;
		try {
			parsed = JSON.parse(raw);
		} catch {
			return null;
		}
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
			return null;
		}

		const name = str(parsed.name);
		const amount = Number(parsed.amount);
		const price = Number(parsed.price);
		if (!name || !Number.isFinite(amount) || !Number.isFinite(price)) {
			return null;
		}
		if (parts.some((x) => x.name === name)) {
			return null;
		}

		parts.push({ amount, name, price });
	}
	return parts;
}

function getNewId(userId) {
	return getNextId(userId, 'estimate', async () => {
		const estimate = await findEstimate(userId, {}, { estimateId: 1 }).sort({ estimateId: -1 }).collation({ locale: 'en_US', numericOrdering: true });
		const max = Number(estimate?.estimateId ?? 0);
		if (isNaN(max)) {
			throw error(500, 'ID invalida');
		}
		return max;
	});
}

export function findEstimate(userId, filters, projection = { __v: 0 }) {
	const Estimate = getModel(userId, 'Estimate');
	return Estimate.findOne(filters, { ...projection, _id: 0 }).lean();
}

export function findEstimates(userId, filters, projection = { __v: 0 }) {
	const Estimate = getModel(userId, 'Estimate');
	return Estimate.find(filters, { ...projection, _id: 0 }).lean();
}

export function deleteEstimates(userId, filters) {
	const Estimate = getModel(userId, 'Estimate');
	return Estimate.deleteMany(filters);
}

export function upsertEstimate(userId, estimate) {
	const Estimate = getModel(userId, 'Estimate');
	return Estimate.findOneAndUpdate({ estimateId: estimate.estimateId }, estimate, { new: true, upsert: true });
}

export async function upsertEstimateAction(event) {
	try {
		const userId = event.locals.userId;
		if (!userId) {
			return;
		}

		const form = await event.request.formData();
		const estimate = {
			estimateId: str(form.get('estimateId')),
			vehicleId: str(form.get('vehicleId')).replace(/\s+/g, '').toUpperCase(),
			carMakeId: str(form.get('carMakeId')),
			carModelId: str(form.get('carModelId')),
			carModelName: str(form.get('carModelName')),
			km: toNumber(form.get('km')),
			description: str(form.get('description')),
			labor: toNumber(form.get('labor')),
			parts: toParts(form.getAll('part')),
		};

		if (!estimate.vehicleId) {
			return fail(400, { vehicleIdError: 'Ingrese la patente' });
		}
		if (!estimate.description) {
			return fail(400, { descriptionError: 'Ingrese una descripción' });
		}
		if (!estimate.parts) {
			return fail(400, { nameError: 'Hay un repuesto inválido' });
		}
		if (estimate.km === null) {
			return fail(400, { kmError: 'Ingrese un kilometraje válido' });
		}
		if (estimate.labor === null || estimate.labor < 0) {
			return fail(400, { laborError: 'Ingrese un importe válido' });
		}
		estimate.km = estimate.km ?? null;
		estimate.labor = estimate.labor ?? 0;
		if (!estimate.estimateId) {
			estimate.estimateId = await getNewId(userId);
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
		handleServerError(err, 'upsertEstimateAction');
	}
}

export async function deleteEstimateAction(event) {
	try {
		const userId = event.locals.userId;
		if (!userId) {
			return;
		}

		const form = await event.request.formData();
		const estimateId = str(form.get('estimateId'));
		if (!estimateId) {
			throw error(400, 'Falta el identificador');
		}

		const Estimate = getModel(userId, 'Estimate');
		const { deletedCount } = await Estimate.deleteOne({ estimateId });
		if (!deletedCount) {
			throw error(404, 'Presupuesto no encontrado');
		}
		throw redirect(307, '/');
	} catch (err) {
		handleServerError(err, 'deleteEstimateAction');
	}
}

export async function sendEstimateAction(event) {
	try {
		const userId = event.locals.userId;
		if (!userId) {
			return;
		}
		if (userId === 'demo') {
			throw error(403, 'El envío de correos está desactivado en la cuenta de demostración');
		}

		const form = await event.request.formData();
		const estimateId = str(form.get('estimateId'));
		const email = str(form.get('email'));
		if (!estimateId) {
			throw error(400, 'Falta el identificador');
		}
		if (!email) {
			return fail(400, { emailError: 'Ingrese un email' });
		}

		const [estimate, user] = await Promise.all([findEstimate(userId, { estimateId }).populate({ path: 'carModel', populate: { path: 'carMake' } }), findUser(userId, { userId })]);
		if (!estimate) {
			throw error(404, 'Presupuesto no encontrado');
		}
		if (!user) {
			event.cookies.delete('auth-token', { path: '/' });
			throw redirect(307, '/login');
		}

		const rendered = render(Estimate, { props: { estimate, user } });
		if (!rendered?.html) {
			throw error(500, 'Presupuesto no renderizado');
		}

		const transporter = nodemailer.createTransport({
			host: 'mail.smtp2go.com',
			port: 2525,
			secure: false,
			auth: {
				user: MAIL_USER,
				pass: MAIL_PASS,
			},
		});
		const data = await transporter.sendMail({
			from: 'taller@calarco.com.ar',
			to: email,
			subject: 'Presupuesto',
			html: rendered.html,
		});
		if (!data?.accepted?.includes(email)) {
			throw error(502, 'No se pudo enviar el correo');
		}

		const EstimateModel = getModel(userId, 'Estimate');
		await EstimateModel.updateOne({ estimateId }, { email });
		return { data: JSON.parse(JSON.stringify(data)) };
	} catch (err) {
		handleServerError(err, 'sendEstimateAction');
	}
}
