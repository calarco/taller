import { error, fail } from '@sveltejs/kit';
import { getModel, getNextId } from '$lib/server/db';
import { handleServerError } from '$lib/server/errors.js';
import { str, toDate } from '$lib/server/validate.js';
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
			date: toDate(form.get('date')),
			description: str(form.get('description')),
			carMakeId: str(form.get('carMakeId')),
			carModelName: str(form.get('carModelName')),
			carModelId: str(form.get('carModelId')),
		};

		if (!appointment.description) {
			return fail(400, { descriptionError: 'Ingrese una descripción' });
		}
		if (!appointment.date) {
			return fail(400, { descriptionError: 'Ingrese una fecha válida' });
		}
		if (appointment.carModelName && appointment.carMakeId && !appointment.carModelId) {
			const carModel = await createCarModel(userId, { carMakeId: appointment.carMakeId, name: appointment.carModelName });
			appointment.carModelId = carModel.carModelId;
		}
		appointment.appointmentId = await getNewId(userId);

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
		const appointmentId = str(form.get('appointmentId'));
		if (!appointmentId) {
			throw error(400, 'Falta el identificador');
		}

		const Appointment = getModel(userId, 'Appointment');
		const { deletedCount } = await Appointment.deleteOne({ appointmentId });
		if (!deletedCount) {
			throw error(404, 'Turno no encontrado');
		}
		const message = 'Turno borrado';
		return { message };
	} catch (err) {
		handleServerError(err, 'deleteAppointmentAction');
	}
}
