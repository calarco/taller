<script>
	import { fade, fly } from 'svelte/transition';
	import { sineIn, sineOut } from 'svelte/easing';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { windowState } from '$lib/shared.svelte.js';
	import Label from '$lib/components/Label.svelte';

	let { carModelProp } = $props();

	let carModelId = $derived(carModelProp || '');
	let carMakeId = $derived(page.data.carModels?.find((x) => x.carModelId === carModelId)?.carMakeId || '');

	let carMakes = $derived(page.data.carMakes || []);
	let carModels = $derived(page.data.carModels?.filter((x) => x.carMakeId === carMakeId) || []);

	let createMake = $derived(!carMakes.length);
	let createModel = $derived(carMakeId && !carModels.length);

	let carModelName = $state('');
	$effect(() => {
		if (!createModel) {
			carModelName = '';
			delete windowState.error?.carModelError;
		}
	});

	function focus(el) {
		el.focus();
	}
</script>

<fieldset>
	<Label
		title="Marca"
		isCreate={createMake}
		onCreate={(e) => {
			e.preventDefault();
			createMake = !createMake;
			createModel = false;
			delete windowState.error?.carMakeError;
		}}
		showCreate={carMakes.length}
		error={windowState.error?.carMakeError}
	>
		<div class="container">
			{#if createMake}
				<form
					action="?/createCarMake"
					method="POST"
					use:enhance={() => {
						windowState.loading = true;
						windowState.error = {};
						return async ({ result, update }) => {
							update({ invalidateAll: false });
							windowState.loading = false;
							if (result.type === 'success' && result.data?.carMake) {
								const data = [...page.data.carMakes, result.data.carMake];
								data.sort((a, b) => a.name - b.name);
								page.data.carMakes = data;
								carMakes = data;
								carMakeId = result.data.carMake.carMakeId;
								createMake = false;
							}
							if (result.type === 'failure' && result.data) {
								windowState.error = result.data;
							}
						};
					}}
					in:fly={{ y: '-1rem', duration: 200, easing: sineIn }}
					out:fly={{ y: '-1rem', duration: 150, easing: sineOut }}
				>
					<input type="text" name="name" placeholder="-" autoComplete="off" use:focus />
					<button type="submit" aria-label="crear">
						<span class="icon ok"></span>
					</button>
				</form>
			{:else}
				<select name="carMakeId" autoComplete="off" bind:value={carMakeId} in:fade={{ duration: 200, easing: sineIn }} out:fade={{ duration: 150, easing: sineOut }}>
					{#each carMakes as carMake (carMake.carMakeId)}
						<option value={carMake.carMakeId}>
							{carMake.name}
						</option>
					{/each}
				</select>
			{/if}
		</div>
	</Label>
	<Label
		title="Modelo"
		isCreate={createModel}
		onCreate={(e) => {
			e.preventDefault();
			createModel = !createModel;
			createMake = false;
		}}
		showCreate={carModels.length}
		error={windowState.error?.carModelError}
	>
		<div class="container">
			{#if carMakeId && (createModel || !carModels.length)}
				<input type="hidden" name="carModelName" value={carModelName} />
				<form
					action="?/createCarModel"
					method="POST"
					use:enhance={() => {
						windowState.loading = true;
						windowState.error = {};
						return async ({ result, update }) => {
							update({ invalidateAll: false });
							if (result.type === 'success' && result.data?.carModel) {
								const data = [...page.data.carModels, result.data.carModel];
								data.sort((a, b) => a.name - b.name);
								page.data.carModels = data;
								carModels = data.filter((x) => x.carMakeId === result.data.carModel.carMakeId);
								carModelId = result.data.carModel.carModelId;
								createModel = false;
							}
							if (result.type === 'failure' && result.data) {
								windowState.error = result.data;
							}
							windowState.loading = false;
						};
					}}
					in:fly={{ y: '-1rem', duration: 200, easing: sineOut }}
					out:fly={{ y: '-1rem', duration: 150, easing: sineIn }}
				>
					<input type="hidden" name="carMakeId" value={carMakeId} />
					<input type="text" name="name" placeholder="-" autoComplete="off" disabled={createMake} bind:value={carModelName} use:focus />
					<button type="submit" disabled={createMake} aria-label="crear">
						<span class="icon ok"></span>
					</button>
				</form>
			{:else}
				<select
					name="carModelId"
					placeholder="-"
					autoComplete="off"
					disabled={!carMakeId}
					bind:value={carModelId}
					in:fade={{ duration: 200, easing: sineOut }}
					out:fade={{ duration: 150, easing: sineIn }}
				>
					{#each carModels as carModel (carModel.carModelId)}
						<option value={carModel.carModelId}>
							{carModel.name}
						</option>
					{/each}
				</select>
			{/if}
		</div>
	</Label>
</fieldset>

<style>
	fieldset {
		grid-column-end: var(--column-end, span 1);
		grid-row-end: var(--row-end, span 2);
		height: 100%;
		background: var(--surface);
		display: flex;
		flex-direction: var(--flow, column);
	}

	.container {
		position: relative;
		height: 2rem;

		> form {
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
			display: grid;
			grid-auto-flow: column;
			gap: 0.5rem;
			grid-template-columns: 1fr auto;

			> button {
				padding: 0.25rem 0.5rem;
				border: none;

				&:disabled {
					opacity: 0.5;
				}

				.icon::before {
					background: var(--secondary);
				}
			}
		}
	}
</style>
