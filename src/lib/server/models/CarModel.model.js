import mongoose from 'mongoose';

const CarModelSchema = mongoose.Schema(
	{
		carModelId: String,
		name: String,
		carMakeId: String,
	},
	{
		timestamps: true,
	}
);

CarModelSchema.index({ carModelId: 1 }, { unique: true });
CarModelSchema.index({ carMakeId: 1, name: 1 }, { unique: true });

CarModelSchema.set('toObject', { virtuals: true });
CarModelSchema.set('toJSON', { virtuals: true });

CarModelSchema.virtual('carMake', {
	ref: 'CarMake',
	localField: 'carMakeId',
	foreignField: 'carMakeId',
	justOne: true,
});

export default CarModelSchema;
