import { applyAction, deserialize } from '$app/forms';
import { windowState, startLoading, endLoading } from '$lib/shared.svelte.js';
import { invalidateSearch } from '$lib/search.svelte.js';

export function enhanceSubmit({ onResult, ...options } = {}) {
	return () => {
		startLoading();
		windowState.error = {};

		return async ({ result, update }) => {
			if (result.type === 'failure' && result.data) {
				windowState.error = result.data;
			}
			if (result.type === 'success' || result.type === 'redirect') {
				invalidateSearch();
			}
			onResult?.(result);

			try {
				await update(options);
			} finally {
				endLoading();
			}
		};
	};
}

export async function postAction(action, fields) {
	const body = new FormData();
	for (const [key, value] of Object.entries(fields)) {
		body.append(key, value ?? '');
	}

	startLoading();
	windowState.error = {};
	try {
		const response = await fetch(action, {
			method: 'POST',
			headers: { 'x-sveltekit-action': 'true' },
			body,
		});
		const result = deserialize(await response.text());

		if (result.type === 'failure' && result.data) {
			windowState.error = result.data;
		}
		if (result.type === 'success' || result.type === 'redirect') {
			invalidateSearch();
		}
		if (result.type === 'error' || result.type === 'redirect') {
			await applyAction(result);
		}
		return result;
	} finally {
		endLoading();
	}
}
