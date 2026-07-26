import { error } from '@sveltejs/kit';
import { findClients } from '$lib/server/controllers/Client.controller';
import { findVehicles } from '$lib/server/controllers/Vehicle.controller';
import { findRepairs } from '$lib/server/controllers/Repair.controller';
import { findEstimates } from '$lib/server/controllers/Estimate.controller';
import { findCarMakes } from '$lib/server/controllers/CarMake.controller';
import { findCarModels } from '$lib/server/controllers/CarModel.controller';

const LIMIT = 25;
const QUERY_LIMIT = 50;

const carModelPopulate = {
	path: 'carModel',
	populate: { path: 'carMake', select: 'name' },
	select: 'name carMakeId',
};

const clientPopulate = {
	path: 'vehicles',
	perDocumentLimit: 1,
	options: { sort: { updatedAt: -1 } },
	populate: [carModelPopulate, { path: 'repairs', perDocumentLimit: 1, options: { sort: { updatedAt: -1 } } }],
};

const repairPopulate = {
	path: 'vehicle',
	populate: [carModelPopulate, { path: 'client', select: 'name lastName' }],
};

function escapeRegex(value) {
	return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function termFilter(terms, fields) {
	return {
		$and: terms.map((term) => {
			const regex = { $regex: escapeRegex(term), $options: 'i' };
			return { $or: fields.map((field) => ({ [field]: regex })) };
		}),
	};
}

function anyFilter(fields, value) {
	const regex = { $regex: escapeRegex(value), $options: 'i' };
	return fields.map((field) => ({ [field]: regex }));
}

function rank(query, ...texts) {
	const needles = query.plateLower && query.plateLower !== query.lower ? [query.lower, query.plateLower] : [query.lower];
	let best = 0.5;
	for (const text of texts) {
		if (!text) {
			continue;
		}
		const value = String(text).toLowerCase();
		for (const needle of needles) {
			if (value === needle) {
				return 3;
			}
			if (value.startsWith(needle)) {
				best = Math.max(best, 2);
			} else if (value.includes(needle)) {
				best = Math.max(best, 1);
			}
		}
	}
	return best;
}

function fullName(entity) {
	return [entity?.name, entity?.lastName].filter(Boolean).join(' ');
}

function mapClient(x, score) {
	const repair = x.vehicles?.repairs?.length ? x.vehicles.repairs[0] : null;
	return {
		id: 'c' + x.clientId,
		clientId: x.clientId,
		clientName: fullName(x),
		vehicleId: x.vehicles?.vehicleId,
		carModelId: x.vehicles?.carModelId,
		carModel: x.vehicles?.carModel,
		repairId: repair?.repairId || '',
		description: repair?.description || '',
		updatedAt: new Date(Math.max(repair?.updatedAt || 0, x.vehicles?.updatedAt || 0, x.updatedAt)),
		score,
	};
}

function mapVehicle(x, score) {
	return {
		id: 'v' + x.vehicleId,
		vehicleId: x.vehicleId,
		clientId: x.clientId,
		clientName: fullName(x.client),
		carModelId: x.carModelId,
		carModel: x.carModel,
		updatedAt: x.updatedAt,
		score,
	};
}

function mapRepair(x, score) {
	return {
		id: 'r' + x.repairId,
		clientId: x.vehicle.clientId,
		clientName: fullName(x.vehicle.client),
		vehicleId: x.vehicle.vehicleId,
		carModelId: x.vehicle.carModelId,
		carModel: x.vehicle.carModel,
		repairId: x.repairId,
		description: x.description,
		updatedAt: x.updatedAt,
		score,
	};
}

function mapEstimate(x, score) {
	return {
		id: 'e' + x.estimateId,
		estimateId: x.estimateId,
		vehicleId: x.vehicleId,
		carModelId: x.carModelId,
		carModel: x.carModel,
		description: x.description,
		email: x.email,
		updatedAt: x.updatedAt,
		score,
	};
}

function finalize(rows) {
	const byId = new Map();
	for (const row of rows) {
		if (!row.clientId && !row.estimateId) {
			continue;
		}
		const existing = byId.get(row.id);
		if (!existing || row.score > existing.score) {
			byId.set(row.id, row);
		}
	}
	const search = [...byId.values()]
		.sort((a, b) => b.score - a.score || b.updatedAt - a.updatedAt)
		.slice(0, LIMIT)
		.map((row) => {
			const result = { ...row };
			delete result.score;
			return result;
		});
	return structuredClone(search);
}

function findClientHits(userId, query) {
	return findClients(userId, termFilter(query.terms, ['name', 'lastName', 'dni', 'work', 'phone', 'email']))
		.sort({ name: 1, lastName: 1 })
		.populate(clientPopulate)
		.limit(QUERY_LIMIT);
}

export async function getSearch(userId, value, type) {
	try {
		const raw = String(value || '')
			.trim()
			.replace(/\s+/g, ' ');
		if (!raw) {
			const [clients, estimates] = await Promise.all([
				findClients(userId).sort({ updatedAt: -1 }).populate(clientPopulate).limit(LIMIT),
				findEstimates(userId).sort({ updatedAt: -1 }).populate(carModelPopulate).limit(LIMIT),
			]);
			return finalize([...clients.map((x) => mapClient(x, 0)), ...estimates.map((x) => mapEstimate(x, 0))]);
		}

		const query = {
			raw,
			lower: raw.toLowerCase(),
			plateLower: raw.replace(/[\s-]/g, '').toLowerCase(),
			terms: raw.split(' '),
		};

		if (type === 'client') {
			const clients = await findClientHits(userId, query);
			return finalize(clients.map((x) => mapClient(x, rank(query, fullName(x), x.name, x.lastName, x.dni, x.phone, x.email))));
		}

		const [carMakes, carModels] = await Promise.all([findCarMakes(userId), findCarModels(userId)]);
		const makes = new Map(carMakes.map((x) => [x.carMakeId, x.name || '']));
		const carModelIds = carModels
			.filter((x) => {
				const label = `${makes.get(x.carMakeId) || ''} ${x.name || ''}`.toLowerCase();
				return query.terms.every((term) => label.includes(term.toLowerCase()));
			})
			.map((x) => x.carModelId);

		const plateFilter = query.plateLower ? anyFilter(['vehicleId', 'vin'], query.plateLower) : [];
		const vehicleFilter = [...plateFilter, ...(carModelIds.length ? [{ carModelId: { $in: carModelIds } }] : [])];

		const [clients, vehicles, repairs, estimates] = await Promise.all([
			findClientHits(userId, query),
			vehicleFilter.length
				? findVehicles(userId, { $or: vehicleFilter })
						.sort({ updatedAt: -1 })
						.populate([carModelPopulate, { path: 'client', select: 'name lastName' }])
						.limit(QUERY_LIMIT)
				: [],
			findRepairs(userId, termFilter(query.terms, ['description', 'detail']))
				.sort({ updatedAt: -1 })
				.populate(repairPopulate)
				.limit(QUERY_LIMIT),
			findEstimates(userId, { $or: [termFilter(query.terms, ['description', 'email']), ...(query.plateLower ? anyFilter(['vehicleId'], query.plateLower) : []), { estimateId: query.raw }] })
				.sort({ updatedAt: -1 })
				.populate(carModelPopulate)
				.limit(QUERY_LIMIT),
		]);

		const search = [
			...clients.map((x) => mapClient(x, rank(query, fullName(x), x.name, x.lastName, x.dni, x.phone, x.email))),
			...vehicles.map((x) => mapVehicle(x, rank(query, x.vehicleId, x.vin, `${x.carModel?.carMake?.name || ''} ${x.carModel?.name || ''}`.trim()))),
			...repairs.filter((x) => x.vehicle?.vehicleId).map((x) => mapRepair(x, rank(query, x.description, x.detail))),
			...estimates.map((x) => mapEstimate(x, rank(query, x.estimateId, x.description, x.email, x.vehicleId))),
		];

		return finalize(search);
	} catch (err) {
		throw error(500, err.body || err.toString());
	}
}
