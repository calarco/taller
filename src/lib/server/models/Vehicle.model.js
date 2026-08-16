import mongoose from 'mongoose';

const VehicleSchema = mongoose.Schema(
	{
		vehicleId: String,
		clientId: String,
		carModelId: String,
		year: Number,
		fuel: String,
		displacement: Number,
		vin: String,
	},
	{
		timestamps: true,
	}
);

VehicleSchema.index({ vehicleId: 1 }, { unique: true });
VehicleSchema.index({ clientId: 1, updatedAt: -1 });
VehicleSchema.index({ carModelId: 1 });

VehicleSchema.set('toObject', { virtuals: true });
VehicleSchema.set('toJSON', { virtuals: true });

VehicleSchema.virtual('carModel', {
	ref: 'CarModel',
	localField: 'carModelId',
	foreignField: 'carModelId',
	justOne: true,
});

VehicleSchema.virtual('client', {
	ref: 'Client',
	localField: 'clientId',
	foreignField: 'clientId',
	justOne: true,
});

export default VehicleSchema;
