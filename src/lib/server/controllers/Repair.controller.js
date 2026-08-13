import { error, fail, redirect } from '@sveltejs/kit';
import { getModel, repository } from '$lib/server/db';
import { handleServerError } from '$lib/server/errors.js';
import { str, toNumber, toDate } from '$lib/server/validate.js';
import { touchVehicle } from '$lib/server/controllers/Vehicle.controller';

const repairs = repository('Repair', 'repairId');

export const findRepair = repairs.find;
export const findRepairs = repairs.findMany;
export const deleteRepairs = repairs.removeMany;

export async function upsertRepair(userId, repair) {
	const data = await repairs.upsert(userId, repair);
	await touchVehicle(userId, data.vehicleId);
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
			repairId: str(form.get('repairId')),
			vehicleId: event.params.vehicleId,
			date: toDate(form.get('date')),
			km: toNumber(form.get('km')),
			description: str(form.get('description')),
			detail: str(form.get('detail')),
			cost: toNumber(form.get('cost')) ?? 0,
			labor: toNumber(form.get('labor')) ?? 0,
		};

		if (!repair.description) {
			return fail(400, { descriptionError: 'Ingrese una descripción' });
		}
		if (!repair.date) {
			return fail(400, { dateError: 'Ingrese una fecha válida' });
		}
		if (repair.km === null) {
			return fail(400, { kmError: 'Ingrese un kilometraje válido' });
		}
		if (repair.cost === null || repair.cost < 0) {
			return fail(400, { costError: 'Ingrese un importe válido' });
		}
		if (repair.labor === null || repair.labor < 0) {
			return fail(400, { laborError: 'Ingrese un importe válido' });
		}
		repair.km = repair.km ?? null;
		if (!repair.repairId) {
			repair.repairId = await repairs.nextId(userId);
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
		const repairId = str(form.get('repairId'));
		if (!repairId) {
			throw error(400, 'Falta el identificador');
		}

		const Repair = getModel(userId, 'Repair');
		const { deletedCount } = await Repair.deleteOne({ repairId, vehicleId: event.params.vehicleId });
		if (!deletedCount) {
			throw error(404, 'Reparación no encontrada');
		}
		throw redirect(307, `/${event.params.clientId}/${event.params.vehicleId}`);
	} catch (err) {
		handleServerError(err, 'deleteRepairAction');
	}
}
