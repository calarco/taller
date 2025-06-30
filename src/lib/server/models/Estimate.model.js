import mongoose from 'mongoose';

const EstimateSchema = mongoose.Schema({
	estimateId: String,
	vehicleId: String,
	carModelId: String,
	km: Number,
	description: String,
	labor: Number,
	parts: { type: Array, default: [] },
	email: String
}, {
	timestamps: true
});

EstimateSchema.index({ estimateId: 1 });

EstimateSchema.set('toObject', { virtuals: true });
EstimateSchema.set('toJSON', { virtuals: true });

EstimateSchema.virtual('carModel', {
	ref: 'CarModel',
	localField: 'carModelId',
	foreignField: 'carModelId',
	justOne: true
});

export default EstimateSchema;
