<script>
	import { fly, blur } from 'svelte/transition';
	import { sineIn, sineOut } from 'svelte/easing';
	import { enhance } from '$app/forms';
	import { windowState } from '$lib/shared.svelte.js';

	let { action, children } = $props();
</script>

<form
	{action}
	method="POST"
	use:enhance={() => {
		windowState.loading = true;
		windowState.error = {};
		return async ({ result, update }) => {
			update();
			windowState.loading = false;
			if (result.type === 'success' || result.type === 'redirect') {
				windowState.form = '';
				windowState.id = '';
			}
			if (result.type === 'failure' && result.data) {
				windowState.error = result.data;
			}
		};
	}}
	in:fly={{ y: '-1rem', duration: 200, easing: sineOut }}
	out:blur={{ amount: 32, duration: 150, easing: sineIn }}
>
	{@render children()}
	<div class="formButtons">
		<button
			type="button"
			onclick={() => {
				windowState.form = '';
				windowState.id = '';
			}}
		>
			Cancelar
		</button>
		<button type="submit">Guardar</button>
	</div>
</form>

<style>
	form {
		pointer-events: auto;
		position: absolute;
		z-index: 1500;
		top: 0;
		left: 0;
		right: 0;
		min-width: 18.5rem;
		border-radius: 4px;
		outline: 1px solid var(--primary);
		background: var(--primary);
		box-shadow: var(--shadow);
		display: grid;
		gap: 1px;
		align-items: stretch;
		grid-template-columns: var(--grid-columns);
	}
</style>
