import mongoose from 'mongoose';

const UserSchema = mongoose.Schema({
	userId: String,
	password: String,
	name: String,
	lastName: String,
	darkTheme: { type: Boolean, default: false }
}, {
	timestamps: true
});

UserSchema.index({ userId: 1 });

UserSchema.set('toObject', { virtuals: true });
UserSchema.set('toJSON', { virtuals: true });

export default UserSchema;
