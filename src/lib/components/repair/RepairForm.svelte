<script>
	import { sineIn, sineOut } from 'svelte/easing';
	import { windowState } from '$lib/shared.svelte.js';
	import Form from '$lib/components/Form.svelte';
	import Label from '$lib/components/Label.svelte';

	let { repair } = $props();

	let isCreate = $derived(!repair?.repairId);
	let cost = $state(repair?.cost || '');
	let labor = $state(repair?.labor || '');
</script>

<Form action="?/upsertRepair" isCreate={isCreate} --grid-columns="1fr 1fr 1fr 1fr [end]">
	<div class="formTitle">
		<div>
			{#if isCreate}
				<span class="icon create" in:blur={{ amount: 16, duration: 200, easing: sineOut }} out:blur={{ amount: 16, duration: 150, easing: sineIn }}> </span>
			{:else}
				<span class="icon edit" in:blur={{ amount: 16, duration: 200, easing: sineOut }} out:blur={{ amount: 16, duration: 150, easing: sineIn }}> </span>
			{/if}
		</div>
		<span>Reparación</span>
	</div>
	{#if !isCreate}
		<input type="hidden" name="repairId" value={repair.repairId} />
	{/if}
	<Label title="Fecha">
		<input type="date" name="date" placeholder="-" autoComplete="off" value={(repair?.date || new Date()).toISOString().substring(0, 10)} />
	</Label>
	<Label title="Mano de obra" --template-columns="max-content 1fr">
		<h6 class="unit">$</h6>
		<input class="precio" type="number" min="0" name="labor" placeholder="0" autoComplete="off" bind:value={labor} />
	</Label>
	<Label title="Repuestos" --template-columns="max-content 1fr">
		<h6 class="unit">$</h6>
		<input class="precio" type="number" min="0" name="cost" placeholder="0" autoComplete="off" bind:value={cost} />
	</Label>
	<Label title="Total" --template-columns="max-content 1fr">
		<h6 class="unit">$</h6>
		<h5 class="precio">{new Intl.NumberFormat('es-AR').format(cost + labor)}</h5>
	</Label>
	<Label title="Descripción" error={windowState.error?.descriptionError} --column-end="span 3">
		<input type="text" name="description" placeholder="-" autoComplete="off" value={repair?.description || ''} />
	</Label>
	<Label title="KM">
		<input type="number" min="0" name="km" placeholder="-" autoComplete="off" value={repair?.km || ''} />
	</Label>
	<Label title="Detalle" --column-end="span 4">
		<textarea rows="5" name="detail" placeholder="-" autoComplete="off">{repair?.detail || ''}</textarea>
	</Label>
</Form>

<style>
	.precio {
		font-family: var(--font-family-alt);
	}
</style>
