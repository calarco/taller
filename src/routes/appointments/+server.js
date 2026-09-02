import { error, json } from '@sveltejs/kit';
import { handleServerError } from '$lib/server/errors.js';
import { toDate } from '$lib/server/validate.js';
import { findAppointment, findAppointmentsBetween } from '$lib/server/controllers/Appointment.controller.js';
import { carModelPopulate } from '$lib/server/controllers/CarModel.controller.js';

export const GET = async (event) => {
	const userId = event.locals.userId;
	if (!userId) {
		return json([]);
	}

	try {
		const params = event.url.searchParams;
		const from = toDate(params.get('from'));
		const to = toDate(params.get('to'));
		if (!from || !to) {
			throw error(400, 'Rango de fechas invalido');
		}

		if (params.get('type') === 'past') {
			const [appointments, older] = await Promise.all([
				findAppointmentsBetween(userId, from, to).sort({ date: -1 }).populate(carModelPopulate),
				findAppointment(userId, { date: { $lt: from } }, { date: 1 }).sort({ date: -1 }),
			]);
			return json({ appointments, older: older?.date ?? null });
		}

		const [appointments, newer] = await Promise.all([
			findAppointmentsBetween(userId, from, to).sort({ date: 1 }).populate(carModelPopulate),
			findAppointment(userId, { date: { $gte: to } }, { date: 1 }).sort({ date: 1 }),
		]);
		return json({ appointments, newer: newer?.date ?? null });
	} catch (err) {
		handleServerError(err, 'appointments endpoint');
	}
};
