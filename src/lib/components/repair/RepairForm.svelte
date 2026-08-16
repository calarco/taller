<script>
	import { untrack } from 'svelte';
	import { windowState, toISODate, toLocalISODate } from '$lib/shared.svelte.js';
	import Form from '$lib/components/Form.svelte';
	import Label from '$lib/components/Label.svelte';

	let { repair } = $props();

	let isCreate = $derived(!repair?.repairId);
	let cost = $state(untrack(() => repair?.cost ?? ''));
	let labor = $state(untrack(() => repair?.labor ?? ''));
	let total = $derived(Number(cost || 0) + Number(labor || 0));

	let repairId;
	$effect(() => {
		if (repairId !== repair?.repairId) {
			repairId = repair?.repairId;
			cost = repair?.cost ?? '';
			labor = repair?.labor ?? '';
		}
	});

	let date = $derived(repair?.date ? toISODate(new Date(repair.date)) : toLocalISODate(new Date()));
</script>

<Form action="?/upsertRepair" {isCreate} --grid-columns="1fr 1fr 1fr 1fr [end]">
	<div class="formTitle">
		<div>
			{#if isCreate}
				<span class="icon create"> </span>
			{:else}
				<span class="icon edit"> </span>
			{/if}
		</div>
		<span>Reparación</span>
	</div>
	{#if !isCreate}
		<input type="hidden" name="repairId" value={repair.repairId} />
	{/if}
	<Label title="Fecha" error={windowState.error?.dateError}>
		<input type="date" name="date" placeholder="-" autocomplete="off" value={date} />
	</Label>
	<Label title="Mano de obra" --template-columns="max-content 1fr">
		<h6 class="unit">$</h6>
		<input class="price" type="number" min="0" name="labor" placeholder="0" autoComplete="off" bind:value={labor} />
	</Label>
	<Label title="Repuestos" --template-columns="max-content 1fr">
		<h6 class="unit">$</h6>
		<input class="price" type="number" min="0" name="cost" placeholder="0" autoComplete="off" bind:value={cost} />
	</Label>
	<Label title="Total" --template-columns="max-content 1fr">
		<h6 class="unit">$</h6>
		<h5 class="price">{new Intl.NumberFormat('es-AR').format(total)}</h5>
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
	.price {
		font-family: var(--font-family-alt);
	}
</style>
