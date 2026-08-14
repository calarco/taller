import { error, fail, redirect } from '@sveltejs/kit';
import { getModel, repository, toPlain } from '$lib/server/db';
import { handleServerError } from '$lib/server/errors.js';
import { str, toNumber } from '$lib/server/validate.js';
import { createCarModel } from '$lib/server/controllers/CarModel.controller.js';
import { touchClient } from '$lib/server/controllers/Client.controller';
import { deleteEstimates } from '$lib/server/controllers/Estimate.controller.js';
import { deleteRepairs, moveRepairs } from '$lib/server/controllers/Repair.controller';

const vehicles = repository('Vehicle', 'vehicleId');

export const findVehicle = vehicles.find;
export const findVehicles = vehicles.findMany;
export const deleteVehicles = vehicles.removeMany;

export async function touchVehicle(userId, vehicleId) {
	if (!vehicleId) {
		return;
	}
	await vehicles.touch(userId, vehicleId);

	const vehicle = await findVehicle(userId, { vehicleId }, { clientId: 1 });
	await touchClient(userId, vehicle?.clientId);
}

export async function upsertVehicle(userId, vehicle) {
	const Vehicle = getModel(userId, 'Vehicle');
	const data = await Vehicle.findOneAndUpdate({ vehicleId: vehicle.oldVehicleId || vehicle.vehicleId }, vehicle, { returnDocument: 'after', upsert: true });
	if (vehicle.oldVehicleId && vehicle.oldVehicleId !== vehicle.vehicleId) {
		await moveRepairs(userId, vehicle.oldVehicleId, vehicle.vehicleId);
	}
	await touchClient(userId, data.clientId);
	return data;
}

export async function upsertVehicleAction(event) {
	try {
		const userId = event.locals.userId;
		if (!userId) {
			return;
		}

		const form = await event.request.formData();
		const vehicle = {
			vehicleId: str(form.get('vehicleId')).replace(/\s+/g, '').toUpperCase(),
			oldVehicleId: str(form.get('oldVehicleId')),
			clientId: str(form.get('clientId')) || event.params.clientId,
			carMakeId: str(form.get('carMakeId')),
			carModelId: str(form.get('carModelId')),
			carModelName: str(form.get('carModelName')),
			year: toNumber(form.get('year')),
			displacement: toNumber(form.get('displacement')),
			fuel: str(form.get('fuel')),
			vin: str(form.get('vin')).toUpperCase(),
		};

		if (!vehicle.vehicleId) {
			return fail(400, { vehicleIdError: 'Ingrese la patente' });
		}
		if (!vehicle.clientId) {
			return fail(400, { clientIdError: 'Ingrese el cliente' });
		}
		if (vehicle.year === null) {
			return fail(400, { yearError: 'Ingrese un año válido' });
		}
		if (vehicle.year !== undefined && (vehicle.year < 1900 || vehicle.year > 9999)) {
			return fail(400, { yearError: 'Ingrese un año entre 1900 y 9999' });
		}
		if (vehicle.displacement === null) {
			return fail(400, { displacementError: 'Ingrese una cilindrada válida' });
		}
		if (vehicle.displacement !== undefined && vehicle.displacement < 0) {
			return fail(400, { displacementError: 'La cilindrada no puede ser negativa' });
		}
		vehicle.year = vehicle.year ?? null;
		vehicle.displacement = vehicle.displacement ?? null;
		if (vehicle.oldVehicleId !== vehicle.vehicleId) {
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
		return { data: toPlain(data) };
	} catch (err) {
		handleServerError(err, 'upsertVehicleAction');
	}
}

export async function deleteVehicleAction(event) {
	try {
		const userId = event.locals.userId;
		if (!userId) {
			return;
		}

		const form = await event.request.formData();
		const vehicleId = str(form.get('vehicleId'));
		if (!vehicleId) {
			throw error(400, 'Falta el identificador');
		}

		const vehicle = await findVehicle(userId, { vehicleId }, { vehicleId: 1 });
		if (!vehicle) {
			throw error(404, 'Vehículo no encontrado');
		}

		await Promise.all([vehicles.remove(userId, { vehicleId }), deleteRepairs(userId, { vehicleId }), deleteEstimates(userId, { vehicleId })]);
		throw redirect(307, `/${event.params.clientId}`);
	} catch (err) {
		handleServerError(err, 'deleteVehicleAction');
	}
}
