import { handleServerError } from '$lib/server/errors.js';
import { toDayStart } from '$lib/server/validate.js';
import { findUser } from '$lib/server/controllers/User.controller.js';
import { findAppointments } from '$lib/server/controllers/Appointment.controller.js';
import { getSearch } from '$lib/server/controllers/Search.controller.js';
import { carModelPopulate } from '$lib/server/controllers/CarModel.controller.js';

export const load = async (event) => {
	const userId = event.locals.userId;
	if (!userId) {
		return;
	}

	try {
		const today = toDayStart(new Date());
		const [user, appointments, pastAppointments, search] = await Promise.all([
			findUser(userId, { userId }),
			findAppointments(userId, { date: { $gte: today } }).populate(carModelPopulate),
			findAppointments(userId, { date: { $lt: today } })
				.sort({ date: -1 })
				.limit(50)
				.populate(carModelPopulate),
			getSearch(userId),
		]);

		return {
			user: structuredClone(user),
			appointments: structuredClone(appointments),
			pastAppointments: structuredClone(pastAppointments),
			search,
		};
	} catch (err) {
		handleServerError(err, 'layout.server load');
	}
};
