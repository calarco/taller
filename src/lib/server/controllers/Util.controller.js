import { error } from '@sveltejs/kit';
import { findClients } from '$lib/server/controllers/Client.controller';
import { findVehicles } from '$lib/server/controllers/Vehicle.controller';
import { findEstimates } from '$lib/server/controllers/Estimate.controller';

export async function getSearch(userId, value) {
	try {
		let [clients, vehicles, estimates] = [];
		if (!value) {
			[clients, estimates] = await Promise.all([
				findClients(userId)
					.sort({ updatedAt: -1 })
					.populate({
						path: 'vehicles',
						perDocumentLimit: 1,
						options: { sort: { updatedAt: -1 } },
						populate: [
							{ path: 'carModel', populate: { path: 'carMake', select: 'name' }, select: 'name carMakeId' },
							{ path: 'repairs', perDocumentLimit: 1, options: { sort: { updatedAt: -1 } } },
						],
					})
					.limit(25),
				findEstimates(userId)
					.sort({ updatedAt: -1 })
					.populate({ path: 'carModel', populate: { path: 'carMake', select: 'name' }, select: 'name carMakeId' })
					.limit(25),
			]);
		} else {
			const filter = { $regex: value, $options: 'i' };
			[clients, vehicles] = await Promise.all([
				findClients(userId, { $or: [{ name: filter }, { lastName: filter }] })
					.sort({ name: 1, lastName: 1 })
					.limit(25),
				findVehicles(userId, { vehicleId: filter })
					.sort({ vehicleId: 1 })
					.populate([
						{ path: 'carModel', populate: { path: 'carMake', select: 'name' }, select: 'name carMakeId' },
						{ path: 'client', select: 'name lastName' },
					])
					.limit(25),
			]);
		}

		const search = [
			...(estimates || []).map((x) => ({
				id: x.estimateId,
				estimateId: x.estimateId,
				vehicleId: x.vehicleId,
				carModelId: x.carModelId,
				carModel: x.carModel,
				description: x.description,
				email: x.email,
				updatedAt: x.updatedAt,
			})),
			...(vehicles || []).map((x) => ({
				id: x.vehicleId,
				vehicleId: x.vehicleId,
				clientId: x.clientId,
				clientName: x.client?.name + ' ' + x.client?.lastName,
				carModelId: x.carModelId,
				carModel: x.carModel,
				updatedAt: x.updatedAt,
			})),
			...(clients || []).map((x) => ({
				id: x.clientId,
				clientId: x.clientId,
				clientName: x.name + ' ' + x.lastName,
				vehicleId: x.vehicles?.vehicleId,
				carModelId: x.vehicles?.carModelId,
				carModel: x.vehicles?.carModel,
				repairId: x.vehicles?.repairs?.length ? x.vehicles.repairs[0].repairId : '',
				description: x.vehicles?.repairs?.length ? x.vehicles.repairs[0].description : '',
				updatedAt: new Date(Math.max(x.vehicles?.repairs?.length ? x.vehicles.repairs[0].updatedAt : 0, x.vehicles?.updatedAt || 0, x.updatedAt)),
			})),
		];

		if (!value) {
			return structuredClone(search.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 25));
		} else {
			return structuredClone(search);
		}
	} catch (err) {
		throw error(500, err.body || err.toString());
	}
}
