// One-shot generator for the demo fixture Demo.controller.js loads on reset.
// Dates are day offsets (negative = past), so the fixture never ages. Seeded, so re-runs diff cleanly.

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../src/lib/server/demo-fixture.json');

const CLIENTS = 120;
const ESTIMATES = 30;
const RECENT_ESTIMATES = 6; // how many land in the last few days, so they reach the "Recientes" panel
const APPOINTMENTS = 44;
const UPCOMING_APPOINTMENTS = 30; // the calendar panel loads only future turnos
const FORTNIGHT_APPOINTMENTS = 22; // of those, how many land inside the next two weeks
const HISTORY_DAYS = 1800; // ~5 years of history
const SEED = 20260808;

let seed = SEED;
function random() {
	seed |= 0;
	seed = (seed + 0x6d2b79f5) | 0;
	let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function int(min, max) {
	return Math.floor(random() * (max - min + 1)) + min;
}

function pick(list) {
	return list[Math.floor(random() * list.length)];
}

function chance(probability) {
	return random() < probability;
}

function round(value, step) {
	return Math.round(value / step) * step;
}

const MAKES = {
	Ford: ['Focus', 'Fiesta', 'Ranger', 'EcoSport', 'Ka'],
	Chevrolet: ['Corsa', 'Onix', 'Cruze', 'S10', 'Agile'],
	Volkswagen: ['Gol', 'Amarok', 'Suran', 'Vento', 'Polo'],
	Fiat: ['Palio', 'Uno', 'Cronos', 'Toro', 'Siena'],
	Renault: ['Clio', 'Sandero', 'Duster', 'Kangoo', 'Logan'],
	Peugeot: ['206', '208', '307', 'Partner', '408'],
	Toyota: ['Hilux', 'Corolla', 'Etios', 'Yaris'],
	Citroën: ['C3', 'C4', 'Berlingo'],
	Honda: ['Civic', 'Fit', 'HR-V'],
	Nissan: ['Frontier', 'March', 'Versa'],
	Chery: ['Tiggo', 'QQ'],
	Jeep: ['Renegade', 'Compass'],
	Hyundai: ['i10', 'Tucson'],
	Kia: ['Rio', 'Sportage'],
	'Mercedes-Benz': ['Sprinter', 'Vito'],
};

const NAMES = [
	'Juan',
	'María',
	'Carlos',
	'Ana',
	'Jorge',
	'Laura',
	'Diego',
	'Silvia',
	'Roberto',
	'Marta',
	'Sergio',
	'Gabriela',
	'Pablo',
	'Claudia',
	'Fernando',
	'Verónica',
	'Ricardo',
	'Patricia',
	'Alejandro',
	'Mónica',
	'Miguel',
	'Andrea',
	'Daniel',
	'Cecilia',
	'Héctor',
	'Lucía',
	'Osvaldo',
	'Beatriz',
	'Rubén',
	'Elena',
	'Néstor',
	'Sandra',
	'Gustavo',
	'Norma',
	'Raúl',
	'Adriana',
	'Oscar',
	'Susana',
	'Marcelo',
	'Estela',
	'Julián',
	'Rocío',
	'Emilio',
	'Valeria',
	'Facundo',
	'Natalia',
	'Matías',
	'Carolina',
	'Leandro',
	'Florencia',
];

const LAST_NAMES = [
	'González',
	'Rodríguez',
	'Fernández',
	'López',
	'Martínez',
	'Pérez',
	'García',
	'Sánchez',
	'Romero',
	'Sosa',
	'Álvarez',
	'Torres',
	'Ruiz',
	'Ramírez',
	'Flores',
	'Benítez',
	'Acosta',
	'Medina',
	'Herrera',
	'Aguirre',
	'Pereyra',
	'Gómez',
	'Giménez',
	'Molina',
	'Silva',
	'Castro',
	'Rojas',
	'Ortiz',
	'Núñez',
	'Luna',
	'Juárez',
	'Cabrera',
	'Ríos',
	'Morales',
	'Godoy',
	'Moreno',
	'Ferrari',
	'Peralta',
	'Vega',
	'Carrizo',
	'Quiroga',
	'Ledesma',
	'Villalba',
	'Ojeda',
	'Miranda',
	'Bianchi',
	'Coronel',
	'Maldonado',
	'Ponce',
	'Vera',
];

const WORKS = [
	'Distribuidora del Sur',
	'Panadería La Espiga',
	'Transporte Andino',
	'Ferretería Central',
	'Almacén Don Pedro',
	'Logística Pampa',
	'Estudio Contable Riva',
	'Vivero El Ombú',
	'Corralón San Martín',
	'Frigorífico Norte',
];

const REPAIRS = [
	'Servicio',
	'Service completo',
	'Distribución',
	'Embrague',
	'Frenos',
	'Suspensión',
	'Escape',
	'Batería',
	'Alternador',
	'Bomba de agua',
	'Radiador',
	'Amortiguadores',
	'Correa alternador',
	'Bujías',
	'Inyectores',
	'Dirección',
	'Caja',
	'Tren delantero',
	'Electricidad',
	'Diagnóstico',
	'Varios',
	'Cambio de aceite',
	'Refrigeración',
	'Arranque',
];

const DETAILS = [
	'Cambio de aceite y filtros',
	'Reemplazo kit de distribución completo',
	'Reemplazo kit de embrague y cilindro',
	'Pastillas y discos delanteros',
	'Amortiguadores delanteros y espirales',
	'Reparación de escape, silenciador nuevo',
	'Batería nueva y control de carga',
	'Reemplazo de alternador reacondicionado',
	'Bomba de agua y refrigerante',
	'Radiador nuevo, purga del circuito',
	'Rótulas y extremos de dirección',
	'Bujías, cables y limpieza de inyectores',
	'Control de tren delantero y alineación',
	'Diagnóstico por scanner, borrado de fallas',
	'Limpieza de cuerpo de mariposa',
	'Reemplazo de bomba de combustible',
	'Control general y ajuste de frenos',
	'Cambio de correa poly V y tensor',
	'Reparación de instalación eléctrica',
	'Sensor de oxígeno y control de emisiones',
	'Cambio de líquido de frenos',
	'Tacos de motor y soporte de caja',
	'',
];

const PARTS = [
	'Filtro de aceite',
	'Filtro de aire',
	'Filtro de combustible',
	'Filtro de habitáculo',
	'Bujías',
	'Kit de distribución',
	'Correa alternador',
	'Bomba de agua',
	'Rueda tensora',
	'Pastillas de freno',
	'Discos de freno',
	'Amortiguadores delanteros',
	'Amortiguadores traseros',
	'Rótulas',
	'Extremos de dirección',
	'Aceite 5W30 x 4L',
	'Refrigerante',
	'Batería',
	'Kit de embrague',
	'Cables de bujía',
	'Bomba de combustible',
	'Alineación y balanceo',
	'Líquido de frenos',
	'Tacos de motor',
];

const ESTIMATE_DESCRIPTIONS = [
	'Service completo',
	'Cambio de distribución',
	'Reemplazo de embrague',
	'Frenos delanteros',
	'Suspensión delantera',
	'Control general',
	'Diagnóstico de falla',
	'Reemplazo bomba de agua',
	'Tren delantero completo',
	'Service y frenos',
];

const FUELS = ['Nafta', 'Nafta', 'Nafta', 'Diesel', 'GNC'];

const LETTERS = 'ABCDEFGHJKLMNPRSTUVWXYZ';
const VIN_CHARS = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'.split(''); // no O, I or Q — upsertVehicleAction rejects them

function slug(value) {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();
}

// --- car makes and models -----------------------------------------------------------------------

const carMakes = [];
const carModels = [];
for (const [make, models] of Object.entries(MAKES)) {
	const carMakeId = String(carMakes.length + 1);
	carMakes.push({ carMakeId, name: make, createdAt: -HISTORY_DAYS, updatedAt: -HISTORY_DAYS });
	for (const model of models) {
		carModels.push({ carModelId: String(carModels.length + 1), name: model, carMakeId, createdAt: -HISTORY_DAYS, updatedAt: -HISTORY_DAYS });
	}
}

// --- clients ------------------------------------------------------------------------------------

const clients = [];
for (let i = 1; i <= CLIENTS; i += 1) {
	const name = pick(NAMES);
	const lastName = pick(LAST_NAMES);
	const createdAt = -int(30, HISTORY_DAYS);
	clients.push({
		clientId: String(i),
		name,
		lastName,
		dni: chance(0.06) ? String(int(12, 46)) + String(int(100000, 999999)) : '',
		work: chance(0.06) ? pick(WORKS) : '',
		phone: chance(0.9) ? `15${int(1000000, 9999999)}` : '',
		email: chance(0.05) ? `${slug(name)}.${slug(lastName)}@example.com` : '',
		createdAt,
		updatedAt: createdAt,
	});
}

// --- vehicles -----------------------------------------------------------------------------------

const plates = new Set();
function plate(year) {
	for (;;) {
		let value;
		if (year < 2016) {
			value = `${pick(LETTERS)}${pick(LETTERS)}${pick(LETTERS)}${int(100, 999)}`;
		} else {
			value = `${pick(LETTERS)}${pick(LETTERS)}${int(100, 999)}${pick(LETTERS)}${pick(LETTERS)}`;
		}
		if (!plates.has(value)) {
			plates.add(value);
			return value;
		}
	}
}

function vin() {
	let value = '';
	for (let i = 0; i < 17; i += 1) {
		value += pick(VIN_CHARS);
	}
	return value;
}

const vehicles = [];
for (const client of clients) {
	// most clients have one vehicle, a few have two or three
	const count = chance(0.78) ? 1 : chance(0.75) ? 2 : 3;
	for (let i = 0; i < count; i += 1) {
		const year = int(1998, 2024);
		vehicles.push({
			vehicleId: plate(year),
			clientId: client.clientId,
			carModelId: pick(carModels).carModelId,
			year,
			fuel: pick(FUELS),
			displacement: chance(0.35) ? Number((int(10, 30) / 10).toFixed(1)) : null,
			vin: chance(0.12) ? vin() : '',
			createdAt: client.createdAt,
			updatedAt: client.createdAt,
		});
	}
}

// --- repairs ------------------------------------------------------------------------------------

const repairs = [];
let repairId = 0;
for (const vehicle of vehicles) {
	// skewed low: most vehicles came in once or twice, a few are regulars
	const count = chance(0.42) ? int(1, 2) : chance(0.7) ? int(3, 5) : int(6, 10);
	const span = -vehicle.createdAt;

	const days = [];
	for (let i = 0; i < count; i += 1) {
		days.push(-int(0, span));
	}
	days.sort((a, b) => a - b);

	// km walks forward with the visits, so the odometer history never goes backwards
	let km = int(2, 20) * 10000;
	for (const date of days) {
		km += int(3000, 22000);
		repairId += 1;
		const labor = round(int(40, 400) * 1000, 1000);
		repairs.push({
			repairId: String(repairId),
			vehicleId: vehicle.vehicleId,
			date,
			km,
			description: pick(REPAIRS),
			detail: pick(DETAILS),
			cost: chance(0.85) ? round(int(20, 900) * 1000, 1000) : 0,
			labor,
			createdAt: date,
			updatedAt: date,
		});
		if (date > vehicle.updatedAt) {
			vehicle.updatedAt = date;
		}
	}
}

// a client is "recent" when its last visit was recent — that ordering drives the search panel
const clientsById = new Map(clients.map((client) => [client.clientId, client]));
for (const vehicle of vehicles) {
	const client = clientsById.get(vehicle.clientId);
	if (vehicle.updatedAt > client.updatedAt) {
		client.updatedAt = vehicle.updatedAt;
	}
}

// --- estimates ----------------------------------------------------------------------------------

const estimates = [];
for (let i = 1; i <= ESTIMATES; i += 1) {
	const vehicle = pick(vehicles);
	// The "Recientes" panel merges clients and estimates and sorts both by updatedAt, so estimates
	// only show up there if some are as recent as the newest repairs. Spread the rest over two years.
	const createdAt = i <= RECENT_ESTIMATES ? -int(0, 6) : -int(7, 900);
	const parts = [];
	const used = new Set();
	const count = int(2, 6);
	for (let j = 0; j < count; j += 1) {
		const name = pick(PARTS);
		if (used.has(name)) {
			continue;
		}
		used.add(name);
		parts.push({ amount: chance(0.75) ? 1 : int(2, 4), name, price: round(int(8, 260) * 1000, 500) });
	}
	estimates.push({
		estimateId: String(i),
		vehicleId: vehicle.vehicleId,
		carModelId: vehicle.carModelId,
		km: int(30000, 320000),
		description: pick(ESTIMATE_DESCRIPTIONS),
		labor: round(int(50, 500) * 1000, 1000),
		parts,
		email: '',
		createdAt,
		updatedAt: createdAt,
	});
}

// --- appointments -------------------------------------------------------------------------------

const appointments = [];
for (let i = 1; i <= APPOINTMENTS; i += 1) {
	// the calendar opens on today and renders a row per day, so most upcoming turnos land inside the
	// next two weeks; the rest spread over the following month, and the remainder are history
	const date = i <= FORTNIGHT_APPOINTMENTS ? int(0, 13) : i <= UPCOMING_APPOINTMENTS ? int(14, 42) : -int(1, 400);
	// booked before the visit, and never in the future — an upcoming turno was booked in the past
	const createdAt = date > 0 ? -int(0, 25) : date - int(1, 20);
	appointments.push({
		appointmentId: String(i),
		date,
		description: pick(REPAIRS),
		carModelId: pick(carModels).carModelId,
		createdAt,
		updatedAt: createdAt,
	});
}

// --- write --------------------------------------------------------------------------------------

const fixture = { carMakes, carModels, clients, vehicles, repairs, estimates, appointments };

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${JSON.stringify(fixture, null, '\t')}\n`);

for (const [key, value] of Object.entries(fixture)) {
	console.log(`${key}: ${value.length}`);
}
console.log(`\nwrote ${OUT}`);
