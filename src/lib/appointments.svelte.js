import { startLoading, endLoading, toISODate } from '$lib/shared.svelte.js';
import { MONTHS_PER_BLOCK, PAGE_AMOUNT } from '$lib/paging.js';

let version = $state(0);

export function invalidateAppointments() {
	version += 1;
}

export function appointmentsVersion() {
	return version;
}

async function fetchAppointments(params) {
	startLoading();
	try {
		const response = await fetch(`/appointments?${params}`);
		return response.ok ? await response.json() : null;
	} catch {
		return null;
	} finally {
		endLoading();
	}
}

function today() {
	const date = new Date();
	return { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() };
}

function monthsBack(year, month, count) {
	const date = new Date(year, month - count, 1);
	return { year: date.getFullYear(), month: date.getMonth() };
}

function monthAfter(value) {
	const date = new Date(value);
	const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
	return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
}

let extra = $state([]);
let start = null;
let horizon = null;
let frontier;
let pending = false;

export const upcoming = {
	get extra() {
		return extra;
	},
	async loadBlock(from, to) {
		if (pending || (horizon && to <= horizon)) {
			return;
		}
		if (frontier !== undefined && (frontier === null || frontier >= toISODate(to))) {
			start = start ?? from;
			horizon = to;
			return;
		}
		pending = true;
		try {
			const data = await fetchAppointments(`from=${toISODate(from)}&to=${toISODate(to)}`);
			extra.push(...(data?.appointments ?? []));
			frontier = data?.newer?.slice(0, 10) ?? null;
			start = start ?? from;
			horizon = to;
		} finally {
			pending = false;
		}
	},
	async reload() {
		if (!start || pending) {
			return;
		}
		const data = await fetchAppointments(`from=${toISODate(start)}&to=${toISODate(horizon)}`);
		extra = data?.appointments ?? [];
		frontier = data?.newer?.slice(0, 10) ?? null;
	},
	reset() {
		extra = [];
		start = null;
		horizon = null;
		frontier = undefined;
	},
};

let items = $state([]);
let loaded = $state(false);
let hasMore = $state(true);
let edge = null;
let pastPending = false;

function pastRange() {
	const to = edge ? { year: edge.year, month: edge.month, day: 1 } : today();
	const from = monthsBack(to.year, to.month, edge ? MONTHS_PER_BLOCK : MONTHS_PER_BLOCK - 1);
	return { from, to };
}

function pastQuery(from, to) {
	return `type=past&from=${toISODate(new Date(Date.UTC(from.year, from.month, 1)))}&to=${toISODate(new Date(Date.UTC(to.year, to.month, to.day)))}`;
}

export const past = {
	get items() {
		return items;
	},
	get loaded() {
		return loaded;
	},
	get hasMore() {
		return hasMore;
	},
	async loadMore() {
		if (pastPending || (loaded && !hasMore)) {
			return;
		}
		pastPending = true;
		try {
			let added = 0;
			while (added < PAGE_AMOUNT) {
				const { from, to } = pastRange();
				const data = await fetchAppointments(pastQuery(from, to));
				const rows = data?.appointments ?? [];
				items.push(...rows);
				added += rows.length;
				hasMore = !!data?.older;
				edge = hasMore ? monthAfter(data.older) : from;
				loaded = true;
				if (!hasMore) {
					break;
				}
			}
		} finally {
			pastPending = false;
		}
	},
	async reload() {
		if (!loaded || pastPending) {
			return;
		}
		const data = await fetchAppointments(pastQuery(edge, today()));
		items = data?.appointments ?? [];
		hasMore = !!data?.older;
	},
	reset() {
		items = [];
		loaded = false;
		hasMore = true;
		edge = null;
	},
};

export function resetAppointments() {
	upcoming.reset();
	past.reset();
}
