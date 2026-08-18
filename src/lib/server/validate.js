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

export function toDayStart(value) {
	const date = value instanceof Date ? value : new Date(value);
	return isNaN(date.getTime()) ? null : new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

const buckets = new Map();

export function tooManyAttempts(key) {
	const now = Date.now();
	if (buckets.size > 10000) {
		for (const [staleKey, stale] of buckets) {
			if (now > stale.reset) {
				buckets.delete(staleKey);
			}
		}
	}

	const bucket = buckets.get(key);
	if (!bucket || now > bucket.reset) {
		buckets.set(key, { count: 1, reset: now + 30 * 60 * 1000 });
		return false;
	}

	bucket.count += 1;
	return bucket.count > 15;
}

export function clearAttempts(key) {
	buckets.delete(key);
}
