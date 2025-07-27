import mongoose from 'mongoose';
import { error } from '@sveltejs/kit';
import { MONGODB_URI } from '$env/static/private';
import AppointmentSchema from '$lib/server/models/Appointment.model';
import CarMakeSchema from '$lib/server/models/CarMake.model';
import CarModelSchema from '$lib/server/models/CarModel.model';
import ClientSchema from '$lib/server/models/Client.model';
import EstimateSchema from '$lib/server/models/Estimate.model';
import RepairSchema from '$lib/server/models/Repair.model';
import UserSchema from '$lib/server/models/User.model';
import VehicleSchema from '$lib/server/models/Vehicle.model';

function checkModels(db) {
	if (!db.models['Appointment']) {
		db.model('Appointment', AppointmentSchema);
	}
	if (!db.models['CarMake']) {
		db.model('CarMake', CarMakeSchema);
	}
	if (!db.models['CarModel']) {
		db.model('CarModel', CarModelSchema);
	}
	if (!db.models['Client']) {
		db.model('Client', ClientSchema);
	}
	if (!db.models['Estimate']) {
		db.model('Estimate', EstimateSchema);
	}
	if (!db.models['Repair']) {
		db.model('Repair', RepairSchema);
	}
	if (!db.models['User']) {
		db.model('User', UserSchema);
	}
	if (!db.models['Vehicle']) {
		db.model('Vehicle', VehicleSchema);
	}
}

export async function initDatabase() {
	try {
		const db = await mongoose.connect(MONGODB_URI);
		if (!db) {
			throw error(500, 'Database connection failed');
		}

		checkModels(db);
		return db;
	} catch (err) {
		throw error(500, err.body || err.toString());
	}
}

export function getModel(userId, model) {
	let name = 'taller';
	if (model !== 'User') {
		name = userId;
	}

	const db = mongoose.connection.useDb(name, { useCache: true });
	if (!db) {
		throw error(500, 'Database connection failed');
	}

	checkModels(db);
	return db.model(model);
}

export async function fixData(userId) {
	const CarMake = getModel(userId, 'CarMake');
	await CarMake.updateMany(
		{},
		[
			{
				$set: {
					name: {
						$trim: {
							input: '$name',
						},
					},
					createdAt: {
						$toDate: '$createdAt',
					},
					updatedAt: {
						$toDate: '$createdAt',
					},
				},
			},
		],
		{ timestamps: false }
	);

	const CarModel = getModel(userId, 'CarModel');
	await CarModel.updateMany(
		{},
		[
			{
				$set: {
					name: {
						$trim: {
							input: '$name',
						},
					},
					createdAt: {
						$toDate: '$createdAt',
					},
					updatedAt: {
						$toDate: '$createdAt',
					},
				},
			},
		],
		{ timestamps: false }
	);

	const Client = getModel(userId, 'Client');
	await Client.updateMany(
		{ phone: { $in: ['0000000000', '00000000', '0000000', '000000000', '2230000000', '""'] } },
		[
			{
				$set: {
					phone: '',
				},
			},
		],
		{ timestamps: false }
	);
	await Client.updateMany(
		{ dni: { $in: ['NaN', '""'] } },
		[
			{
				$set: {
					dni: '',
				},
			},
		],
		{ timestamps: false }
	);
	await Client.updateMany(
		{ work: { $in: ['""'] } },
		[
			{
				$set: {
					work: '',
				},
			},
		],
		{ timestamps: false }
	);
	await Client.updateMany(
		{ email: { $in: ['""'] } },
		[
			{
				$set: {
					email: '',
				},
			},
		],
		{ timestamps: false }
	);
	await Client.updateMany(
		{ lastName: { $in: ['""'] } },
		[
			{
				$set: {
					lastName: '',
				},
			},
		],
		{ timestamps: false }
	);
	await Client.updateMany(
		{},
		[
			{
				$set: {
					name: {
						$trim: {
							input: '$name',
						},
					},
					lastName: {
						$trim: {
							input: '$lastName',
						},
					},
					phone: {
						$trim: {
							input: '$phone',
							chars: 'x',
						},
					},
					createdAt: {
						$toDate: '$createdAt',
					},
					updatedAt: {
						$toDate: '$createdAt',
					},
				},
			},
		],
		{ timestamps: false }
	);

	const Repair = getModel(userId, 'Repair');
	await Repair.updateMany({ detail: { $in: ['""'] } }, [
		{
			$set: {
				detail: '',
			},
		},
	]);
	await Repair.updateMany(
		{},
		[
			{
				$set: {
					date: {
						$toDate: '$date',
					},
					createdAt: {
						$toDate: '$createdAt',
					},
					updatedAt: {
						$toDate: '$createdAt',
					},
					vehicleId: {
						$replaceAll: {
							input: '$vehicleId',
							find: ' ',
							replacement: '',
						},
					},
				},
			},
		],
		{ timestamps: false }
	);
	const repairs = await Repair.find({}, { __v: 0, _id: 0 }).lean();
	for (const repair of repairs) {
		if (isNaN(repair.repairId)) {
			await Repair.deleteOne(repair);
		}
	}

	const Vehicle = getModel(userId, 'Vehicle');
	await Vehicle.updateMany(
		{ vin: { $in: ['00000000000000000', '""'] } },
		[
			{
				$set: {
					vin: '',
				},
			},
		],
		{ timestamps: false }
	);
	await Vehicle.updateMany(
		{},
		[
			{
				$set: {
					createdAt: {
						$toDate: '$createdAt',
					},
					updatedAt: {
						$toDate: '$createdAt',
					},
					vehicleId: {
						$replaceAll: {
							input: '$vehicleId',
							find: ' ',
							replacement: '',
						},
					},
				},
			},
		],
		{ timestamps: false }
	);

	const Appointment = getModel(userId, 'Appointment');
	await Appointment.updateMany(
		{},
		[
			{
				$set: {
					date: {
						$toDate: '$date',
					},
					createdAt: {
						$toDate: '$createdAt',
					},
					updatedAt: {
						$toDate: '$createdAt',
					},
					vehicleId: {
						$replaceAll: {
							input: '$vehicleId',
							find: ' ',
							replacement: '',
						},
					},
				},
			},
		],
		{ timestamps: false }
	);

	const Estimate = getModel(userId, 'Estimate');
	await Estimate.updateMany(
		{},
		[
			{
				$set: {
					parts: {
						$function: {
							lang: 'js',
							args: ['$parts'],
							body: 'function(infoStr) { let str = infoStr.slice(1).slice(0, -1).replaceAll(`""`, `"`); try { str = JSON.parse(str); if (Array.isArray(str) && str.length) { str = str.map(function(x) { return { amount: x.cantidad || 1, name: x.repuesto || "", price: x.precio || 0 } }) } } catch(e) {} return str; }',
						},
					},
					createdAt: {
						$toDate: '$createdAt',
					},
					updatedAt: {
						$toDate: '$createdAt',
					},
					vehicleId: {
						$replaceAll: {
							input: '$vehicleId',
							find: ' ',
							replacement: '',
						},
					},
				},
			},
		],
		{ timestamps: false }
	);
}
