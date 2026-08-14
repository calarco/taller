import mongoose from 'mongoose';
import { error } from '@sveltejs/kit';
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

let listening = false;

export async function initDatabase() {
	try {
		if (!listening) {
			listening = true;
			mongoose.connection.on('error', (err) => console.error('[mongo] connection error', err));
			mongoose.connection.on('disconnected', () => console.error('[mongo] disconnected'));
			mongoose.connection.on('reconnected', () => console.error('[mongo] reconnected'));
		}
		return await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000, bufferCommands: false });
	} catch (err) {
		handleServerError(err, 'initDatabase');
	}
}

const registered = new Set();

export function getModel(userId, model) {
	let name = 'taller';
	if (model !== 'User') {
		name = userId;
	}

	const db = mongoose.connection.useDb(name, { useCache: true });
	if (!registered.has(name)) {
		registered.add(name);
		for (const [schemaName, schema] of Object.entries(schemas)) {
			if (!db.models[schemaName]) {
				db.model(schemaName, schema);
			}
		}
	}
	return db.model(model);
}

export function toPlain(doc) {
	if (!doc) {
		return doc;
	}
	const plain = doc.toObject ? doc.toObject({ virtuals: false }) : { ...doc };
	delete plain._id;
	delete plain.__v;
	return plain;
}

export function repository(modelName, idField) {
	const model = (userId) => getModel(userId, modelName);

	return {
		find: (userId, filters, projection = { __v: 0 }) =>
			model(userId)
				.findOne(filters, { ...projection, _id: 0 })
				.lean(),
		findMany: (userId, filters, projection = { __v: 0 }) =>
			model(userId)
				.find(filters, { ...projection, _id: 0 })
				.lean(),
		create: (userId, doc) => model(userId).create(doc),
		upsert: (userId, doc) => model(userId).findOneAndUpdate({ [idField]: doc[idField] }, doc, { returnDocument: 'after', upsert: true }),
		touch: (userId, id) => {
			if (!id) {
				return;
			}
			return model(userId).updateOne({ [idField]: id }, { $currentDate: { updatedAt: true } });
		},
		remove: (userId, filters) => model(userId).deleteOne(filters),
		removeMany: (userId, filters) => model(userId).deleteMany(filters),
		nextId: async (userId) => {
			const counterKey = idField.replace(/Id$/, '');
			const Counter = getModel(userId, 'Counter');

			const bumped = await Counter.findOneAndUpdate({ _id: counterKey }, { $inc: { seq: 1 } }, { returnDocument: 'after' });
			if (bumped) {
				return String(bumped.seq);
			}

			const doc = await model(userId)
				.findOne({}, { [idField]: 1, _id: 0 })
				.sort({ [idField]: -1 })
				.collation({ locale: 'en_US', numericOrdering: true })
				.lean();
			const max = Number(doc?.[idField] ?? 0);
			if (isNaN(max)) {
				throw error(500, 'ID invalida');
			}

			await Counter.updateOne({ _id: counterKey }, { $setOnInsert: { seq: max } }, { upsert: true });
			const seeded = await Counter.findOneAndUpdate({ _id: counterKey }, { $inc: { seq: 1 } }, { returnDocument: 'after' });
			return String(seeded.seq);
		},
	};
}
