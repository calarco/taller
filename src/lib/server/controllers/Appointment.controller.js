import { error, fail } from '@sveltejs/kit';
import { repository, toPlain } from '$lib/server/db';
import { handleServerError } from '$lib/server/errors.js';
import { str, toDate } from '$lib/server/validate.js';
import { createCarModel } from '$lib/server/controllers/CarModel.controller.js';

const appointments = repository('Appointment', 'appointmentId');

export const findAppointment = appointments.find;

export const findAppointments = appointments.findMany;

export const findAppointmentsBetween = (userId, from, to) => findAppointments(userId, { date: { $gte: from, $lt: to } });

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
		appointment.appointmentId = await appointments.nextId(userId);

		const data = await appointments.create(userId, appointment);
		return { data: toPlain(data) };
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

		const { deletedCount } = await appointments.remove(userId, { appointmentId });
		if (!deletedCount) {
			throw error(404, 'Turno no encontrado');
		}
		const message = 'Turno borrado';
		return { message };
	} catch (err) {
		handleServerError(err, 'deleteAppointmentAction');
	}
}
