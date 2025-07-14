import mongoose from 'mongoose';

const VehicleSchema = mongoose.Schema({
	vehicleId: String,
	clientId: String,
	carModelId: String,
	year: Number,
	fuel: String,
	displacement: Number,
	vin: String
}, {
	timestamps: true
});

VehicleSchema.index({ vehicleId: 1 });

VehicleSchema.set('toObject', { virtuals: true });
VehicleSchema.set('toJSON', { virtuals: true });

VehicleSchema.virtual('carModel', {
	ref: 'CarModel',
	localField: 'carModelId',
	foreignField: 'carModelId',
	justOne: true
});

VehicleSchema.virtual('client', {
	ref: 'Client',
	localField: 'clientId',
	foreignField: 'clientId',
	justOne: true
});

VehicleSchema.virtual('repairs', {
	ref: 'Repair',
	localField: 'vehicleId',
	foreignField: 'vehicleId'
});

export default VehicleSchema;
