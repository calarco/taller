<script>
	import { fly, blur } from 'svelte/transition';
	import { blurExit, flyEnter } from '$lib/motion.js';
	import { enhance } from '$app/forms';
	import { windowState } from '$lib/shared.svelte.js';

	let { action, isCreate, children } = $props();
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
	in:fly={flyEnter}
	out:blur={blurExit}
>
	{@render children()}
	<div class="formButtons">
		<button
			type="button"
			onclick={() => {
				windowState.form = '';
				windowState.id = '';
				windowState.data = {};
			}}
		>
			Cancelar
		</button>
		<button type="submit">
			{#if isCreate}
				Crear
			{:else}
				Guardar
			{/if}
		</button>
	</div>
</form>

<style>
	form {
		pointer-events: auto;
		position: absolute;
		z-index: var(--layer-form);
		top: 0;
		left: 0;
		right: 0;
		min-width: 18.5rem;
		border-radius: var(--border-radius);
		outline: 1px solid var(--primary);
		background: var(--primary);
		box-shadow: var(--shadow);
		overflow: clip;
		display: grid;
		gap: 1px;
		align-items: stretch;
		grid-template-columns: var(--grid-columns, none);
	}
</style>
