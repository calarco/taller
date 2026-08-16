import mongoose from 'mongoose';

const ClientSchema = mongoose.Schema(
	{
		clientId: String,
		name: String,
		lastName: String,
		dni: String,
		work: String,
		phone: String,
		email: String,
	},
	{
		timestamps: true,
	}
);

ClientSchema.index({ clientId: 1 }, { unique: true });
ClientSchema.index({ updatedAt: -1 });
ClientSchema.index({ name: 1, lastName: 1 });

ClientSchema.set('toObject', { virtuals: true });
ClientSchema.set('toJSON', { virtuals: true });

export default ClientSchema;
