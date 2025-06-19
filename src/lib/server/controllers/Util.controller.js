import { error } from '@sveltejs/kit';
import { findClients } from '$lib/server/controllers/Client.controller';
import { findVehicles } from '$lib/server/controllers/Vehicle.controller';

export async function getSearch(userId, value) {
	try {
		let [clients, vehicles] = [];
		if (!value) {
			clients = await findClients(userId)
				.sort({ updatedAt: -1 })
				.populate({ path: 'vehicles', perDocumentLimit: 1, options: { sort: { updatedAt: -1 } }, populate: { path: 'repairs', perDocumentLimit: 1, options: { sort: { updatedAt: -1 } } } })
				.limit(50);
		} else {
			const filter = { $regex: value, $options: 'i' };
			[clients, vehicles] = await Promise.all([
				findClients(userId, { $or: [{ name: filter }, { lastName: filter }] })
					.sort({ name: 1, lastName: 1 })
					.limit(25),
				findVehicles(userId, { vehicleId: filter }).sort({ vehicleId: 1 }).populate({ path: 'client', select: 'name lastName' }).limit(25),
			]);
		}

		const search = [
			...(vehicles || []).map((x) => ({
				id: x.vehicleId,
				vehicleId: x.vehicleId,
				clientId: x.clientId,
				clientName: x.client?.name + ' ' + x.client?.lastName,
				carModelId: x.carModelId,
				updatedAt: x.updatedAt,
			})),
			...(clients || []).map((x) => ({
				id: x.clientId,
				clientId: x.clientId,
				clientName: x.name + ' ' + x.lastName,
				vehicleId: x.vehicles?.vehicleId,
				carModelId: x.vehicles?.carModelId,
				repairId: x.vehicles?.repairs?.repairId,
				description: x.vehicles?.repairs?.description,
				updatedAt: x.vehicles?.repairs?.updatedAt ? x.vehicles.repairs.updatedAt : x.vehicles?.updatedAt ? x.vehicles.updatedAt : x.updatedAt,
			})),
		];

		if (!value) {
			return search.sort((a, b) => b.updatedAt - a.updatedAt);
		} else {
			return search;
		}
	} catch (err) {
		throw error(500, err.body || err.toString());
	}
}
