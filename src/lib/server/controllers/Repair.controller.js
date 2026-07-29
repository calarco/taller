import { error, fail, redirect } from '@sveltejs/kit';
import { getModel, getNextId } from '$lib/server/db';
import { handleServerError } from '$lib/server/errors.js';
import { upsertVehicle } from '$lib/server/controllers/Vehicle.controller';

function getNewId(userId) {
	return getNextId(userId, 'repair', async () => {
		const repair = await findRepair(userId, {}, { repairId: 1 }).sort({ repairId: -1 }).collation({ locale: 'en_US', numericOrdering: true });
		const max = Number(repair?.repairId ?? 0);
		if (isNaN(max)) {
			throw error(500, 'ID invalida');
		}
		return max;
	});
}

export function findRepair(userId, filters, projection = { __v: 0 }) {
	const Repair = getModel(userId, 'Repair');
	return Repair.findOne(filters, { ...projection, _id: 0 }).lean();
}

export function findRepairs(userId, filters, projection = { __v: 0 }) {
	const Repair = getModel(userId, 'Repair');
	return Repair.find(filters, { ...projection, _id: 0 }).lean();
}

export function deleteRepairs(userId, filters) {
	const Repair = getModel(userId, 'Repair');
	return Repair.deleteMany(filters);
}

export async function upsertRepair(userId, repair) {
	const Repair = getModel(userId, 'Repair');
	const data = await Repair.findOneAndUpdate({ repairId: repair.repairId }, repair, { new: true, upsert: true });
	await upsertVehicle(userId, { vehicleId: data.vehicleId, updatedAt: true });
	return data;
}

export function moveRepairs(userId, oldId, newId) {
	const Repair = getModel(userId, 'Repair');
	return Repair.updateMany({ vehicleId: oldId }, { vehicleId: newId });
}

export async function upsertRepairAction(event) {
	try {
		const userId = event.locals.userId;
		if (!userId) {
			return;
		}

		const form = await event.request.formData();
		const repair = {
			repairId: form.get('repairId'),
			vehicleId: event.params.vehicleId,
			date: new Date(form.get('date') + 'T00:00:00.000'),
			km: form.get('km'),
			description: form.get('description'),
			detail: form.get('detail'),
			cost: form.get('cost') || 0,
			labor: form.get('labor') || 0,
		};

		if (!repair.repairId) {
			repair.repairId = await getNewId(userId);
		}
		if (!repair.description) {
			return fail(400, { descriptionError: 'Ingrese una descripción' });
		}

		const data = await upsertRepair(userId, repair);
		throw redirect(307, `/${event.params.clientId}/${data.vehicleId}#${data.repairId}`);
	} catch (err) {
		handleServerError(err, 'upsertRepairAction');
	}
}

export async function deleteRepairAction(event) {
	try {
		const userId = event.locals.userId;
		if (!userId) {
			return;
		}

		const form = await event.request.formData();
		const repairId = form.get('repairId');
		if (!repairId) {
			throw error(400, 'Falta el identificador');
		}

		const Repair = getModel(userId, 'Repair');
		await Repair.deleteOne({ repairId });
		throw redirect(307, `/${event.params.clientId}/${event.params.vehicleId}`);
	} catch (err) {
		handleServerError(err, 'deleteRepairAction');
	}
}
