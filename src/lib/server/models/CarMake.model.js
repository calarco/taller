import mongoose from 'mongoose';

const CarMakeSchema = mongoose.Schema({
	carMakeId: String,
	name: String
}, {
	timestamps: true
});

CarMakeSchema.index({ carMakeId: 1 });

CarMakeSchema.set('toObject', { virtuals: true });
CarMakeSchema.set('toJSON', { virtuals: true });

export default CarMakeSchema;
