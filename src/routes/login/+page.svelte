<script>
	import { fade, fly, blur } from 'svelte/transition';
	import { blurExit, flyEnter, panelEnter, panelExit } from '$lib/motion.js';
	import { enhance } from '$app/forms';
	import Label from '$lib/components/Label.svelte';
	import { windowState } from '$lib/shared.svelte';

	let hide = $state(false);
</script>

<div class="container" in:fade={panelEnter} out:fade={panelExit}>
	{#if !hide}
		<form
			method="POST"
			use:enhance={() => {
				windowState.loading = true;
				windowState.error = {};
				return async ({ result, update }) => {
					update();
					windowState.loading = false;
					if (result.type === 'success' || result.type === 'redirect') {
						hide = true;
					}
					if (result.type === 'failure' && result.data) {
						windowState.error = result.data;
					}
				};
			}}
			in:fly={flyEnter}
			out:blur={blurExit}
		>
			<Label title="Usuario" error={windowState.error?.userIdError}>
				<input type="text" name="userId" autoComplete="username" />
			</Label>
			<Label title="Contraseña" error={windowState.error?.passwordError}>
				<input type="password" name="password" autoComplete="current-password" />
			</Label>
			<div class="formButtons">
				<button type="submit">Ingresar</button>
			</div>
		</form>
	{/if}
</div>

<style>
	.container {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: var(--layer-cover);
		display: grid;
		justify-items: center;
		align-items: center;
		overflow: hidden;
		background: var(--overlay);
		backdrop-filter: blur(0.5rem);
	}

	form {
		pointer-events: auto;
		min-width: 18.5rem;
		border-radius: var(--border-radius);
		outline: 1px solid var(--primary);
		background: var(--primary);
		box-shadow: var(--shadow);
		overflow: clip;
		display: grid;
		gap: 1px;
		align-items: stretch;
		grid-template-columns: var(--grid-columns);
	}
</style>
