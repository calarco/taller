import { getModel } from '$lib/server/db';

let fixture;

async function getFixture() {
	if (!fixture) {
		const module = await import('$lib/server/demo-fixture.json');
		fixture = module.default;
	}
	return fixture;
}

export async function resetDemo(userId) {
	if (userId !== 'demo') {
		return;
	}
	try {
		const collections = [
			['carMakes', 'CarMake'],
			['carModels', 'CarModel'],
			['clients', 'Client'],
			['vehicles', 'Vehicle'],
			['repairs', 'Repair'],
			['estimates', 'Estimate'],
			['appointments', 'Appointment'],
		];
		const dateFields = {
			CarMake: ['createdAt', 'updatedAt'],
			CarModel: ['createdAt', 'updatedAt'],
			Client: ['createdAt', 'updatedAt'],
			Vehicle: ['createdAt', 'updatedAt'],
			Repair: ['createdAt', 'updatedAt', 'date'],
			Estimate: ['createdAt', 'updatedAt'],
			Appointment: ['createdAt', 'updatedAt', 'date'],
		};

		const models = [...collections.map(([, model]) => model), 'Counter'];
		await Promise.all(models.map((model) => getModel(userId, model).deleteMany({})));

		const data = await getFixture();
		const now = Date.now();

		for (const [key, model] of collections) {
			const documents = data[key].map((document) => {
				const copy = { ...document };
				for (const field of dateFields[model]) {
					copy[field] = new Date(now + copy[field] * 24 * 60 * 60 * 1000);
				}
				return copy;
			});
			await getModel(userId, model).insertMany(documents, { ordered: false, timestamps: false });
		}
	} catch (err) {
		console.error('[demo] reset failed', err);
	}
}
