import { error, fail, redirect, isRedirect } from '@sveltejs/kit';
import { getModel } from '$lib/server/db';
import { createCarModel } from '$lib/server/controllers/CarModel.controller.js';
import { upsertClient } from '$lib/server/controllers/Client.controller';
import { deleteRepairs, moveRepairs } from '$lib/server/controllers/Repair.controller';

export function findVehicle(userId, filters) {
	const Vehicle = getModel(userId, 'Vehicle');
	return Vehicle.findOne(filters, { __v: 0, _id: 0 }).lean();
}

export function findVehicles(userId, filters) {
	const Vehicle = getModel(userId, 'Vehicle');
	return Vehicle.find(filters, { __v: 0, _id: 0 }).lean();
}

export function deleteByVehicleId(userId, vehicleId) {
	const Vehicle = getModel(userId, 'Vehicle');
	return Promise.all([Vehicle.deleteOne({ vehicleId }), deleteRepairs(userId, { vehicleId })]);
}

export async function upsertVehicle(userId, vehicle) {
	const Vehicle = getModel(userId, 'Vehicle');
	const data = await Vehicle.findOneAndUpdate({ vehicleId: vehicle.oldVehicleId || vehicle.vehicleId }, vehicle, { new: true, upsert: true });
	if (vehicle.oldVehicleId && vehicle.oldVehicleId !== vehicle.vehicleId) {
		await moveRepairs(userId, vehicle.oldVehicleId, vehicle.vehicleId);
	}
	await upsertClient(userId, { clientId: data.clientId, updatedAt: true });
	return data;
}

export async function upsertVehicleAction(event) {
	try {
		const userId = event.cookies.get('userId');
		if (!userId) {
			return;
		}

		const form = await event.request.formData();
		const vehicle = {
			vehicleId: (form.get('vehicleId') || '').replace(/\s+/g, '').toUpperCase(),
			oldVehicleId: form.get('oldVehicleId'),
			clientId: form.get('clientId') || event.params.clientId,
			carMakeId: form.get('carMakeId'),
			carModelId: form.get('carModelId'),
			carModelName: form.get('carModelName'),
			year: form.get('year'),
			displacement: form.get('displacement'),
			fuel: form.get('fuel'),
			vin: (form.get('vin') || '').toUpperCase(),
		};

		if (!vehicle.vehicleId) {
			return fail(400, { vehicleIdError: 'Ingrese la patente' });
		}
		if (!vehicle.clientId) {
			return fail(400, { clientIdError: 'Ingrese el cliente' });
		}
		if (event.params.vehicleId !== vehicle.vehicleId) {
			const existing = await findVehicle(userId, { vehicleId: vehicle.vehicleId });
			if (existing) {
				return fail(400, { vehicleIdError: 'La patente ya existe' });
			}
		}
		if (vehicle.carModelName && vehicle.carMakeId && !vehicle.carModelId) {
			const carModel = await createCarModel(userId, { carMakeId: vehicle.carMakeId, name: vehicle.carModelName });
			vehicle.carModelId = carModel.carModelId;
		}
		if (vehicle.vin) {
			const vin = vehicle.vin;
			if (/\s/.test(vin)) {
				return fail(400, { vinError: 'El vin no puede contener espacios' });
			}
			if (vin.includes('O')) {
				return fail(400, { vinError: 'El vin no puede contener la letra O' });
			}
			if (vin.includes('I')) {
				return fail(400, { vinError: 'El vin no puede contener la letra I' });
			}
			if (vin.includes('Q')) {
				return fail(400, { vinError: 'El vin no puede contener la letra Q' });
			}
			if (vin.length !== 17) {
				return fail(400, { vinError: 'El VIN debe contener 17 caracteres' });
			}
		}

		const data = await upsertVehicle(userId, vehicle);
		if (data.vehicleId !== event.params.vehicleId) {
			throw redirect(307, `/${data.clientId}/${data.vehicleId}`);
		}
		return { data: JSON.parse(JSON.stringify(data)) };
	} catch (err) {
		if (isRedirect(err)) {
			throw err;
		}
		throw error(500, err.body || err.toString());
	}
}

export async function deleteVehicleAction(event) {
	try {
		const userId = event.cookies.get('userId');
		if (!userId) {
			return;
		}

		const form = await event.request.formData();
		const vehicleId = form.get('vehicleId');
		if (!vehicleId) {
			throw error(400, 'Missing id');
		}

		await deleteByVehicleId(userId, vehicleId);
		throw redirect(307, `/${event.params.clientId}`);
	} catch (err) {
		if (isRedirect(err)) {
			throw err;
		}
		throw error(500, err.body || err.toString());
	}
}
