import mongoose from 'mongoose';

const PartSchema = mongoose.Schema(
	{
		amount: Number,
		name: String,
		price: Number,
	},
	{ _id: false, versionKey: false }
);

const EstimateSchema = mongoose.Schema(
	{
		estimateId: String,
		vehicleId: String,
		carModelId: String,
		km: Number,
		description: String,
		labor: Number,
		parts: { type: [PartSchema], default: [] },
		email: String,
	},
	{
		timestamps: true,
	}
);

EstimateSchema.index({ estimateId: 1 }, { unique: true });
EstimateSchema.index({ vehicleId: 1 });
EstimateSchema.index({ updatedAt: -1 });

EstimateSchema.set('toObject', { virtuals: true });
EstimateSchema.set('toJSON', { virtuals: true });

EstimateSchema.virtual('carModel', {
	ref: 'CarModel',
	localField: 'carModelId',
	foreignField: 'carModelId',
	justOne: true,
});

export default EstimateSchema;
