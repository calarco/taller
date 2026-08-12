export function str(value) {
	return typeof value === 'string' ? value.trim() : '';
}

export function toNumber(value) {
	const raw = str(value);
	if (!raw) {
		return undefined;
	}
	if (!/^-?\d+(?:[.,]\d+)?$/.test(raw)) {
		return null;
	}
	const number = Number(raw.replace(',', '.'));
	return Number.isFinite(number) ? number : null;
}

export function toDate(value) {
	const raw = str(value);
	if (!raw) {
		return undefined;
	}
	if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
		return null;
	}
	const date = new Date(`${raw}T00:00:00.000Z`);
	return isNaN(date.getTime()) ? null : date;
}
