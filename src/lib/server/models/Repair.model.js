import mongoose from 'mongoose';

const RepairSchema = mongoose.Schema(
	{
		repairId: String,
		vehicleId: String,
		date: Date,
		km: Number,
		description: String,
		detail: String,
		cost: Number,
		labor: Number,
	},
	{
		timestamps: true,
	}
);

RepairSchema.index({ repairId: 1 }, { unique: true });
RepairSchema.index({ vehicleId: 1, date: -1, updatedAt: -1 });
RepairSchema.index({ updatedAt: -1 });

RepairSchema.set('toObject', { virtuals: true });
RepairSchema.set('toJSON', { virtuals: true });

RepairSchema.virtual('vehicle', {
	ref: 'Vehicle',
	localField: 'vehicleId',
	foreignField: 'vehicleId',
	justOne: true,
});

export default RepairSchema;
