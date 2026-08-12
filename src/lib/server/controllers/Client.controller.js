import { error, fail, redirect } from '@sveltejs/kit';
import { getModel, getNextId } from '$lib/server/db';
import { handleServerError } from '$lib/server/errors.js';
import { str } from '$lib/server/validate.js';
import { findVehicles, deleteByVehicleId } from '$lib/server/controllers/Vehicle.controller';

function getNewId(userId) {
	return getNextId(userId, 'client', async () => {
		const client = await findClient(userId, {}, { clientId: 1 }).sort({ clientId: -1 }).collation({ locale: 'en_US', numericOrdering: true });
		const max = Number(client?.clientId ?? 0);
		if (isNaN(max)) {
			throw error(500, 'ID invalida');
		}
		return max;
	});
}

export function findClient(userId, filters, projection = { __v: 0 }) {
	const Client = getModel(userId, 'Client');
	return Client.findOne(filters, { ...projection, _id: 0 }).lean();
}

export function findClients(userId, filters, projection = { __v: 0 }) {
	const Client = getModel(userId, 'Client');
	return Client.find(filters, { ...projection, _id: 0 }).lean();
}

export function upsertClient(userId, client) {
	const Client = getModel(userId, 'Client');
	return Client.findOneAndUpdate({ clientId: client.clientId }, client, { returnDocument: 'after', upsert: true });
}

export function touchClient(userId, clientId) {
	if (!clientId) {
		return;
	}
	const Client = getModel(userId, 'Client');
	return Client.updateOne({ clientId }, { $currentDate: { updatedAt: true } });
}

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
			client.clientId = await getNewId(userId);
		}

		const data = await upsertClient(userId, client);
		if (data.clientId !== event.params.clientId) {
			throw redirect(307, `/${data.clientId}`);
		}
		return { client: JSON.parse(JSON.stringify(data)) };
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

		const vehicles = await findVehicles(userId, { clientId });
		if (vehicles?.length) {
			await Promise.all(vehicles.map((x) => deleteByVehicleId(userId, x.vehicleId)));
		}
		const Client = getModel(userId, 'Client');
		await Client.deleteOne({ clientId });
		throw redirect(307, '/');
	} catch (err) {
		handleServerError(err, 'deleteClientAction');
	}
}
