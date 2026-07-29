import mongoose from 'mongoose';
import { MONGODB_URI } from '$env/static/private';
import { handleServerError } from '$lib/server/errors.js';
import AppointmentSchema from '$lib/server/models/Appointment.model';
import CarMakeSchema from '$lib/server/models/CarMake.model';
import CarModelSchema from '$lib/server/models/CarModel.model';
import ClientSchema from '$lib/server/models/Client.model';
import CounterSchema from '$lib/server/models/Counter.model';
import EstimateSchema from '$lib/server/models/Estimate.model';
import RepairSchema from '$lib/server/models/Repair.model';
import UserSchema from '$lib/server/models/User.model';
import VehicleSchema from '$lib/server/models/Vehicle.model';

const schemas = {
	Appointment: AppointmentSchema,
	CarMake: CarMakeSchema,
	CarModel: CarModelSchema,
	Client: ClientSchema,
	Counter: CounterSchema,
	Estimate: EstimateSchema,
	Repair: RepairSchema,
	User: UserSchema,
	Vehicle: VehicleSchema,
};

function checkModels(db) {
	for (const [name, schema] of Object.entries(schemas)) {
		if (!db.models[name]) {
			db.model(name, schema);
		}
	}
}

let listening = false;

function watchConnection() {
	if (listening) {
		return;
	}
	listening = true;
	mongoose.connection.on('error', (err) => console.error('[mongo] connection error', err));
	mongoose.connection.on('disconnected', () => console.error('[mongo] disconnected'));
	mongoose.connection.on('reconnected', () => console.error('[mongo] reconnected'));
}

export async function initDatabase() {
	try {
		watchConnection();
		return await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
	} catch (err) {
		handleServerError(err, 'initDatabase');
	}
}

export function getModel(userId, model) {
	let name = 'taller';
	if (model !== 'User') {
		name = userId;
	}

	const db = mongoose.connection.useDb(name, { useCache: true });
	checkModels(db);
	return db.model(model);
}

export async function getNextId(userId, key, findMax) {
	const Counter = getModel(userId, 'Counter');

	const bumped = await Counter.findOneAndUpdate({ _id: key }, { $inc: { seq: 1 } }, { new: true });
	if (bumped) {
		return String(bumped.seq);
	}

	const max = await findMax();
	await Counter.updateOne({ _id: key }, { $setOnInsert: { seq: max } }, { upsert: true });
	const seeded = await Counter.findOneAndUpdate({ _id: key }, { $inc: { seq: 1 } }, { new: true });
	return String(seeded.seq);
}
