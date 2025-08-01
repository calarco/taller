import mongoose from 'mongoose';

const AppointmentSchema = mongoose.Schema({
	appointmentId: String,
	date: Date,
	description: String,
	carModelId: String
}, {
	timestamps: true
});

AppointmentSchema.index({ appointmentId: 1 });

AppointmentSchema.set('toObject', { virtuals: true });
AppointmentSchema.set('toJSON', { virtuals: true });

AppointmentSchema.virtual('carModel', {
	ref: 'CarModel',
	localField: 'carModelId',
	foreignField: 'carModelId',
	justOne: true
});

export default AppointmentSchema;
