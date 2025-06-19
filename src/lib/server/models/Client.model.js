import mongoose from 'mongoose';

const ClientSchema = mongoose.Schema({
	clientId: String,
	name: String,
	lastName: String,
	dni: String,
	work: String,
	phone: String,
	email: String
}, {
	timestamps: true
});

ClientSchema.index({ clientId: 1 });

ClientSchema.set('toObject', { virtuals: true });
ClientSchema.set('toJSON', { virtuals: true });

ClientSchema.virtual('vehicles', {
	ref: 'Vehicle',
	localField: 'clientId',
	foreignField: 'clientId',
	justOne: true
});

export default ClientSchema;
