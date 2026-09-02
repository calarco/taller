import { MONTHS_PER_BLOCK } from '$lib/paging.js';
import { handleServerError } from '$lib/server/errors.js';
import { toDayStart } from '$lib/server/validate.js';
import { findUser } from '$lib/server/controllers/User.controller.js';
import { findAppointmentsBetween } from '$lib/server/controllers/Appointment.controller.js';
import { getSearch } from '$lib/server/controllers/Search.controller.js';
import { carModelPopulate } from '$lib/server/controllers/CarModel.controller.js';

export const load = async (event) => {
	const userId = event.locals.userId;
	if (!userId) {
		return;
	}

	try {
		const now = new Date();
		const [user, appointments, search] = await Promise.all([
			findUser(userId, { userId }),
			findAppointmentsBetween(userId, toDayStart(now), new Date(Date.UTC(now.getFullYear(), now.getMonth() + MONTHS_PER_BLOCK, 1)))
				.sort({ date: 1 })
				.populate(carModelPopulate),
			getSearch(userId),
		]);

		return {
			user: structuredClone(user),
			appointments: structuredClone(appointments),
			search,
		};
	} catch (err) {
		handleServerError(err, 'layout.server load');
	}
};
