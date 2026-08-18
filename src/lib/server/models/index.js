import AppointmentSchema from './Appointment.model.js';
import CarMakeSchema from './CarMake.model.js';
import CarModelSchema from './CarModel.model.js';
import ClientSchema from './Client.model.js';
import CounterSchema from './Counter.model.js';
import EstimateSchema from './Estimate.model.js';
import RepairSchema from './Repair.model.js';
import UserSchema from './User.model.js';
import VehicleSchema from './Vehicle.model.js';

export const mainSchemas = {
	User: UserSchema,
};

export const tenantSchemas = {
	Appointment: AppointmentSchema,
	CarMake: CarMakeSchema,
	CarModel: CarModelSchema,
	Client: ClientSchema,
	Counter: CounterSchema,
	Estimate: EstimateSchema,
	Repair: RepairSchema,
	Vehicle: VehicleSchema,
};
