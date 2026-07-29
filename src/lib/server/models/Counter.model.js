import mongoose from 'mongoose';

const CounterSchema = mongoose.Schema(
	{
		_id: String,
		seq: { type: Number, default: 0 },
	},
	{
		versionKey: false,
	}
);

export default CounterSchema;
