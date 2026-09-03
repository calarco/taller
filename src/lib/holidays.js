import { toLocalISODate } from '$lib/shared.svelte.js';

const cache = new Map();

function easter(year) {
	const a = year % 19;
	const b = Math.floor(year / 100);
	const c = year % 100;
	const d = Math.floor(b / 4);
	const e = b % 4;
	const f = Math.floor((b + 8) / 25);
	const g = Math.floor((b - f + 1) / 3);
	const h = (19 * a + b - d - g + 15) % 30;
	const i = Math.floor(c / 4);
	const k = c % 4;
	const l = (32 + 2 * e + 2 * i - h - k) % 7;
	const m = Math.floor((a + 11 * h + 22 * l) / 451);
	const n = h + l - 7 * m + 114;
	return new Date(year, Math.floor(n / 31) - 1, (n % 31) + 1);
}

function shift(date) {
	const day = date.getDay();
	if (day === 2 || day === 3) {
		return 1 - day;
	}
	if (day === 4 || day === 5) {
		return 8 - day;
	}
	return 0;
}

function build(year) {
	const fixed = [
		[0, 1],
		[2, 24],
		[3, 2],
		[4, 1],
		[4, 25],
		[5, 20],
		[6, 9],
		[11, 8],
		[11, 25],
	];
	const movable = [
		[5, 17],
		[7, 17],
		[9, 12],
		[10, 20],
	];
	const easterOffsets = [-48, -47, -2];

	const dates = new Set();
	for (const [month, day] of fixed) {
		dates.add(toLocalISODate(new Date(year, month, day)));
	}
	const sunday = easter(year);
	for (const offset of easterOffsets) {
		dates.add(toLocalISODate(new Date(year, sunday.getMonth(), sunday.getDate() + offset)));
	}
	for (const [month, day] of movable) {
		dates.add(toLocalISODate(new Date(year, month, day + shift(new Date(year, month, day)))));
	}
	return dates;
}

export function holidays(year) {
	let dates = cache.get(year);
	if (!dates) {
		dates = build(year);
		cache.set(year, dates);
	}
	return dates;
}
