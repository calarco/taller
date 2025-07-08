import { error, fail } from '@sveltejs/kit';
import { getModel } from '$lib/server/db';
import { createCarModel } from '$lib/server/controllers/CarModel.controller.js';

export function findAppointment(userId, filters) {
	const Appointment = getModel(userId, 'Appointment');
	return Appointment.findOne(filters, { __v: 0, _id: 0 }).lean();
}

export function findAppointments(userId, filters) {
	const Appointment = getModel(userId, 'Appointment');
	return Appointment.find(filters, { __v: 0, _id: 0 }).lean();
}

async function getNewId(userId) {
	let max = 1;
	const appointment = await findAppointment(userId, {}, { appointmentId: 1 }).sort({ appointmentId: -1 }).collation({ locale: 'en_US', numericOrdering: true });
	if (appointment?.appointmentId) {
		max = Number(appointment.appointmentId) + 1;
	}
	return String(max);
}

export async function createAppointmentAction(event) {
	try {
		const userId = event.cookies.get('userId');
		if (!userId) {
			return;
		}

		const form = await event.request.formData();
		const appointment = {
			appointmentId: await getNewId(userId),
			date: form.get('date'),
			description: form.get('description'),
			carMakeId: form.get('carMakeId'),
			carModelName: form.get('carModelName'),
			carModelId: form.get('carModelId'),
		};

		if (!appointment.description) {
			return fail(400, { descriptionError: 'Ingrese una descripción' });
		}
		if (appointment.carModelName && appointment.carMakeId && !appointment.carModelId) {
			const carModel = await createCarModel(userId, { carMakeId: appointment.carMakeId, name: appointment.carModelName });
			appointment.carModelId = carModel.carModelId;
		}

		const Appointment = getModel(userId, 'Appointment');
		const data = await Appointment.create(appointment);
		return { data: JSON.parse(JSON.stringify(data)) };
	} catch (err) {
		throw error(500, err.body || err.toString());
	}
}

export async function deleteAppointmentAction(event) {
	try {
		const userId = event.cookies.get('userId');
		if (!userId) {
			return;
		}

		const form = await event.request.formData();
		const appointmentId = form.get('appointmentId');
		if (!appointmentId) {
			return fail(400, 'Missing id');
		}

		const Appointment = getModel(userId, 'Appointment');
		await Appointment.deleteOne({ appointmentId });
		const message = 'Turno borrado';
		return { message };
	} catch (err) {
		throw error(500, err.body || err.toString());
	}
}
