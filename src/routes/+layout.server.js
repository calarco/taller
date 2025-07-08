import { error } from '@sveltejs/kit';
import { findUser } from '$lib/server/controllers/User.controller.js';
import { findCarMakes } from '$lib/server/controllers/CarMake.controller.js';
import { findCarModels } from '$lib/server/controllers/CarModel.controller.js';
import { findAppointments } from '$lib/server/controllers/Appointment.controller.js';
import { getSearch } from '$lib/server/controllers/Util.controller.js';

export const load = async (event) => {
	const userId = event.cookies.get('userId');
	if (!userId) {
		return;
	}

	try {
		const [user, carMakes, carModels, appointments, search] = await Promise.all([
			findUser(userId, { userId }),
			findCarMakes(userId).sort({ name: 1 }),
			findCarModels(userId).sort({ name: 1 }),
			findAppointments(userId, { date: { $gte: new Date((new Date()).setHours(0, 0, 1)) } }),
			getSearch(userId),
		]);
		delete user.password;

		return { user: structuredClone(user), carMakes: structuredClone(carMakes), carModels: structuredClone(carModels), appointments: structuredClone(appointments), search };
	} catch (err) {
		throw error(500, err.body || err.toString());
	}
};
