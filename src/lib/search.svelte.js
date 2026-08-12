import { startLoading, endLoading } from '$lib/shared.svelte.js';

export function createSearch({ type = '' } = {}) {
	let value = $state('');
	let results = $state(null);
	let settled = $state(true);
	let seq = 0;

	$effect(() => {
		const query = value.trim();
		if (!query) {
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
				const response = await fetch(`/search?${type ? 'type=' + type + '&' : ''}q=${encodeURIComponent(query)}`, { signal: controller.signal });
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
			value = next;
		},
		get results() {
			return results;
		},
		get settled() {
			return settled;
		},
	};
}
