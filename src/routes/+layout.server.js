import { handleServerError } from '$lib/server/errors.js';
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
		const [user, appointments, search] = await Promise.all([
			findUser(userId, { userId }),
			findAppointments(userId, { date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }).populate(carModelPopulate),
			getSearch(userId),
		]);

		return { user: structuredClone(user), appointments: structuredClone(appointments), search };
	} catch (err) {
		handleServerError(err, 'layout.server load');
	}
};
