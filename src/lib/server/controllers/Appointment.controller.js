import { error, fail } from '@sveltejs/kit';
import { getModel, getNextId } from '$lib/server/db';
import { handleServerError } from '$lib/server/errors.js';
import { createCarModel } from '$lib/server/controllers/CarModel.controller.js';

function getNewId(userId) {
	return getNextId(userId, 'appointment', async () => {
		const appointment = await findAppointment(userId, {}, { appointmentId: 1 }).sort({ appointmentId: -1 }).collation({ locale: 'en_US', numericOrdering: true });
		const max = Number(appointment?.appointmentId ?? 0);
		if (isNaN(max)) {
			throw error(500, 'ID invalida');
		}
		return max;
	});
}

export function findAppointment(userId, filters, projection = { __v: 0 }) {
	const Appointment = getModel(userId, 'Appointment');
	return Appointment.findOne(filters, { ...projection, _id: 0 }).lean();
}

export function findAppointments(userId, filters, projection = { __v: 0 }) {
	const Appointment = getModel(userId, 'Appointment');
	return Appointment.find(filters, { ...projection, _id: 0 }).lean();
}

export async function createAppointmentAction(event) {
	try {
		const userId = event.locals.userId;
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
		handleServerError(err, 'createAppointmentAction');
	}
}

export async function deleteAppointmentAction(event) {
	try {
		const userId = event.locals.userId;
		if (!userId) {
			return;
		}

		const form = await event.request.formData();
		const appointmentId = form.get('appointmentId');
		if (!appointmentId) {
			throw error(400, 'Falta el identificador');
		}

		const Appointment = getModel(userId, 'Appointment');
		await Appointment.deleteOne({ appointmentId });
		const message = 'Turno borrado';
		return { message };
	} catch (err) {
		handleServerError(err, 'deleteAppointmentAction');
	}
}
