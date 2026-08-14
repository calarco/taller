import { error, fail, redirect } from '@sveltejs/kit';
import { repository, toPlain } from '$lib/server/db';
import { handleServerError } from '$lib/server/errors.js';
import { str } from '$lib/server/validate.js';
import { findVehicles, deleteVehicles } from '$lib/server/controllers/Vehicle.controller';
import { deleteRepairs } from '$lib/server/controllers/Repair.controller';
import { deleteEstimates } from '$lib/server/controllers/Estimate.controller.js';

const clients = repository('Client', 'clientId');

export const findClient = clients.find;
export const findClients = clients.findMany;
export const upsertClient = clients.upsert;

export const touchClient = clients.touch;

export async function upsertClientAction(event) {
	try {
		const userId = event.locals.userId;
		if (!userId) {
			return;
		}

		const form = await event.request.formData();
		const client = {
			clientId: str(form.get('clientId')),
			name: str(form.get('name')),
			lastName: str(form.get('lastName')),
			dni: str(form.get('dni')).toUpperCase(),
			work: str(form.get('work')),
			phone: str(form.get('phone')),
			email: str(form.get('email')).toLowerCase(),
		};

		if (!client.name) {
			return fail(400, { nameError: 'Ingrese el nombre' });
		}
		if (!client.clientId) {
			client.clientId = await clients.nextId(userId);
		}

		const data = await upsertClient(userId, client);
		if (data.clientId !== event.params.clientId) {
			throw redirect(307, `/${data.clientId}`);
		}
		return { client: toPlain(data) };
	} catch (err) {
		handleServerError(err, 'upsertClientAction');
	}
}

export async function deleteClientAction(event) {
	try {
		const userId = event.locals.userId;
		if (!userId) {
			return;
		}

		const form = await event.request.formData();
		const clientId = str(form.get('clientId'));
		if (!clientId) {
			throw error(400, 'Falta el identificador');
		}

		const client = await findClient(userId, { clientId }, { clientId: 1 });
		if (!client) {
			throw error(404, 'Cliente no encontrado');
		}

		const vehicles = await findVehicles(userId, { clientId }, { vehicleId: 1 });
		const vehicleId = { $in: vehicles.map((x) => x.vehicleId) };

		await deleteRepairs(userId, { vehicleId });
		await deleteEstimates(userId, { vehicleId });
		await deleteVehicles(userId, { clientId });
		await clients.remove(userId, { clientId });

		throw redirect(307, '/');
	} catch (err) {
		handleServerError(err, 'deleteClientAction');
	}
}
