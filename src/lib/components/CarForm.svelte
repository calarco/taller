<script>
	import { fade, fly } from 'svelte/transition';
	import { enter, exit, flyEnter, flyExit } from '$lib/motion.js';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import { windowState } from '$lib/shared.svelte.js';
	import { postAction } from '$lib/forms.js';
	import Label from '$lib/components/Label.svelte';

	let { carModelProp } = $props();

	let carModelId = $state(carModelProp || '');
	let carMakeId = $state('');
	let carMakeName = $state('');
	let carModelName = $state('');
	let createMake = $state(false);
	let createModel = $state(false);

	let carMakes = $derived(page.data.carMakes || []);
	let carModels = $derived(page.data.carModels?.filter((x) => x.carMakeId === carMakeId) || []);

	let propMakeId = $derived(page.data.carModels?.find((x) => x.carModelId === carModelProp)?.carMakeId || '');

	let seededProp, seededMake;
	$effect(() => {
		if (seededProp !== carModelProp) {
			seededProp = carModelProp;
			seededMake = undefined;
			carModelId = carModelProp || '';
			carMakeName = '';
			carModelName = '';
			createMake = false;
			createModel = false;
		}
		if (propMakeId && seededMake !== propMakeId) {
			seededMake = propMakeId;
			carMakeId = propMakeId;
		}
	});

	let isCreatingMake = $derived(createMake || !carMakes.length);
	let isCreatingModel = $derived(!!carMakeId && (createModel || !carModels.length));

	function focus(el) {
		el.focus();
	}

	function onEnter(run) {
		return (e) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				run();
			}
		};
	}

	async function createCarMake() {
		if (!carMakeName.trim()) {
			windowState.error = { carMakeError: 'Ingrese la marca' };
			return;
		}
		const result = await postAction('?/createCarMake', { name: carMakeName });
		await invalidate('/cars');
		if (result?.type === 'success' && result.data?.carMake) {
			carMakeId = result.data.carMake.carMakeId;
			carModelId = '';
			carMakeName = '';
			createMake = false;
		}
	}

	async function createCarModel() {
		if (!carModelName.trim()) {
			windowState.error = { carModelError: 'Ingrese el modelo' };
			return;
		}
		const result = await postAction('?/createCarModel', { carMakeId, name: carModelName });
		await invalidate('/cars');
		if (result?.type === 'success' && result.data?.carModel) {
			carModelId = result.data.carModel.carModelId;
			carModelName = '';
			createModel = false;
		}
	}
</script>

<fieldset>
	<input type="hidden" name="carMakeId" value={carMakeId} />
	<input type="hidden" name="carModelId" value={carModelId} />
	<input type="hidden" name="carModelName" value={isCreatingModel ? carModelName : ''} />

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
		<div class="formSlot">
			{#if isCreatingMake}
				<div class="inlineCreate" in:fly={flyEnter} out:fly={flyExit}>
					<input type="text" placeholder="-" autocomplete="off" bind:value={carMakeName} onkeydown={onEnter(createCarMake)} use:focus />
					<button type="button" onclick={createCarMake} aria-label="crear">
						<span class="icon ok"></span>
					</button>
				</div>
			{:else}
				<select
					placeholder="-"
					bind:value={carMakeId}
					onchange={() => {
						carModelId = '';
						createModel = false;
					}}
					in:fade={enter}
					out:fade={exit}
				>
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
			delete windowState.error?.carModelError;
		}}
		showCreate={carModels.length}
		error={windowState.error?.carModelError}
	>
		<div class="formSlot">
			{#if isCreatingModel}
				<div class="inlineCreate" in:fly={flyEnter} out:fly={flyExit}>
					<input type="text" placeholder="-" autocomplete="off" disabled={isCreatingMake} bind:value={carModelName} onkeydown={onEnter(createCarModel)} use:focus />
					<button type="button" onclick={createCarModel} disabled={isCreatingMake} aria-label="crear">
						<span class="icon ok"></span>
					</button>
				</div>
			{:else}
				<select placeholder="-" disabled={!carMakeId} bind:value={carModelId} in:fade={enter} out:fade={exit}>
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

	.formSlot {
		position: relative;
		height: 2rem;

		> .inlineCreate {
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
