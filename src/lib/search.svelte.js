import { startLoading, endLoading } from '$lib/shared.svelte.js';
import { PAGE_AMOUNT } from '$lib/paging.js';

let version = $state(0);

export function invalidateSearch() {
	version += 1;
}

export function createSearch({ type = '' } = {}) {
	let value = $state('');
	let limit = $state(PAGE_AMOUNT);
	let results = $state(null);
	let settled = $state(true);
	let seq = 0;

	$effect(() => {
		version;
		const query = value.trim();
		const size = limit;
		if (!query && size === PAGE_AMOUNT) {
			results = null;
			settled = true;
			return;
		}

		settled = false;
		const controller = new AbortController();
		const timer = setTimeout(async () => {
			const current = ++seq;
			startLoading();
			try {
				const response = await fetch(`/search?${type ? 'type=' + type + '&' : ''}q=${encodeURIComponent(query)}&limit=${size}`, { signal: controller.signal });
				const data = response.ok ? await response.json() : null;
				if (current !== seq) {
					return;
				}
				results = Array.isArray(data) ? data : [];
				settled = true;
			} catch (err) {
				if (err.name !== 'AbortError') {
					results = [];
					settled = true;
				}
			} finally {
				endLoading();
			}
		}, 200);

		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	});

	return {
		get value() {
			return value;
		},
		set value(next) {
			limit = PAGE_AMOUNT;
			value = next;
		},
		get results() {
			return results;
		},
		get settled() {
			return settled;
		},
		get limit() {
			return limit;
		},
		loadMore() {
			if (settled) {
				limit += PAGE_AMOUNT;
			}
		},
		reset() {
			value = '';
			limit = PAGE_AMOUNT;
		},
	};
}
