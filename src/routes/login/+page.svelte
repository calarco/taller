<script>
	import { fade, fly, blur } from 'svelte/transition';
	import { blurExit, flyEnter, panelEnter, panelExit } from '$lib/motion.js';
	import { enhance } from '$app/forms';
	import Label from '$lib/components/Label.svelte';
	import { windowState } from '$lib/shared.svelte';

	let { data } = $props();

	let hide = $state(false);
	let showForm = $state(false);

	function submit() {
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
	}
</script>

<div class="cover" in:fade={panelEnter} out:fade={panelExit}>
	{#if !hide}
		{#if data.landing && !showForm}
			<form class="landing" method="POST" action="?/demo" use:enhance={submit} in:fly={flyEnter} out:blur={blurExit}>
				<div>
					<h1>Taller Calarco</h1>
					<p>Sistema de gestión para talleres mecánicos: clientes, vehículos, reparaciones y presupuestos.</p>
				</div>
				<div class="formButtons">
					<button type="button" onclick={() => (showForm = true)}>Ingresar</button>
					<button type="submit">Probar demo</button>
				</div>
			</form>
		{:else}
			<form method="POST" action="?/login" use:enhance={submit} in:fly={flyEnter} out:blur={blurExit}>
				<Label title="Usuario" error={windowState.error?.userIdError}>
					<input type="text" name="userId" autoComplete="username" />
				</Label>
				<Label title="Contraseña" error={windowState.error?.passwordError}>
					<input type="password" name="password" autoComplete="current-password" />
				</Label>
				<div class="formButtons">
					{#if data.landing}
						<button
							type="button"
							onclick={() => {
								windowState.error = {};
								showForm = false;
							}}
						>
							Volver
						</button>
					{/if}
					<button type="submit">Ingresar</button>
				</div>
			</form>
		{/if}
	{/if}
</div>

<style>
	.cover {
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
		grid-area: 1 / 1;
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

	.landing {
		width: min(32rem, calc(100vw - 2rem));

		> div:first-child {
			padding: 2rem 2rem 1.75rem 2rem;
			background: var(--surface);
			display: grid;
			gap: 1rem;
			justify-items: center;
		}

		p {
			max-width: 24rem;
			text-align: center;
			color: var(--on-background-variant);
		}
	}
</style>
