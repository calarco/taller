import { error, fail, redirect, isRedirect } from '@sveltejs/kit';
import { getModel } from '$lib/server/db';
import { findVehicles, deleteByVehicleId } from '$lib/server/controllers/Vehicle.controller';

async function getNewId(userId) {
	let max = 1;
	const client = await findClient(userId, {}, { clientId: 1 }).sort({ clientId: -1 }).collation({ locale: 'en_US', numericOrdering: true });
	if (client?.clientId) {
		max = Number(client.clientId) + 1;
	}
	if (isNaN(max)) {
		throw error(500, 'ID invalida');
	}
	return String(max);
}

export function findClient(userId, filters) {
	const Client = getModel(userId, 'Client');
	return Client.findOne(filters, { __v: 0, _id: 0 }).lean();
}

export function findClients(userId, filters) {
	const Client = getModel(userId, 'Client');
	return Client.find(filters, { __v: 0, _id: 0 }).lean();
}

export function upsertClient(userId, client) {
	const Client = getModel(userId, 'Client');
	return Client.findOneAndUpdate({ clientId: client.clientId }, client, { new: true, upsert: true });
}

export async function upsertClientAction(event) {
	try {
		const userId = event.cookies.get('userId');
		if (!userId) {
			return;
		}

		const form = await event.request.formData();
		const client = {
			clientId: form.get('clientId'),
			name: (form.get('name') || '').trim(),
			lastName: (form.get('lastName') || '').trim(),
			dni: (form.get('dni') || '').trim().toUpperCase(),
			work: (form.get('work') || '').trim(),
			phone: (form.get('phone') || '').trim(),
			email: (form.get('email') || '').trim().toLowerCase(),
		};

		if (!client.clientId) {
			client.clientId = await getNewId(userId);
		}
		if (!client.name) {
			return fail(400, { nameError: 'Ingrese el nombre' });
		}

		const data = await upsertClient(userId, client);
		if (data.clientId !== event.params.clientId) {
			throw redirect(307, `/${data.clientId}`);
		}
		return { client: JSON.parse(JSON.stringify(data)) };
	} catch (err) {
		if (isRedirect(err)) {
			throw err;
		}
		throw error(500, err.body || err.toString());
	}
}

export async function deleteClientAction(event) {
	try {
		const userId = event.cookies.get('userId');
		if (!userId) {
			return;
		}

		const form = await event.request.formData();
		const clientId = form.get('clientId');
		if (!clientId) {
			return fail(400, 'Missing id');
		}

		const vehicles = await findVehicles(userId, { clientId });
		if (vehicles?.length) {
			await Promise.all(vehicles.map((x) => deleteByVehicleId(userId, x.vehicleId)));
		}
		const Client = getModel(userId, 'Client');
		await Client.deleteOne({ clientId });
		throw redirect(307, '/');
	} catch (err) {
		if (isRedirect(err)) {
			throw err;
		}
		throw error(500, err.body || err.toString());
	}
}
