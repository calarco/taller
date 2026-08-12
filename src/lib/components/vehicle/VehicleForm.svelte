<script>
	import { page } from '$app/state';
	import { windowState } from '$lib/shared.svelte.js';
	import { createSearch } from '$lib/search.svelte.js';
	import Form from '$lib/components/Form.svelte';
	import Label from '$lib/components/Label.svelte';
	import CarForm from '$lib/components/CarForm.svelte';

	let { vehicle } = $props();

	const search = createSearch({ type: 'client' });

	let isCreate = $derived(!vehicle?.vehicleId);
	let clients = $derived((search.results ?? page.data.search ?? []).filter((x) => x.clientId && x.clientName));
	let clientId = $derived(clients.find((x) => x.clientName === search.value)?.clientId || '');
	let clientPlaceholder = $derived([page.data.client?.name, page.data.client?.lastName].filter(Boolean).join(' ') || '-');
</script>

<Form action="?/upsertVehicle" {isCreate} --grid-columns="1fr [start] 1fr 1fr [end]">
	<div class="formTitle">
		<div>
			{#if isCreate}
				<span class="icon create"> </span>
			{:else}
				<span class="icon edit"> </span>
			{/if}
		</div>
		<span>Vehículo</span>
	</div>
	{#if !isCreate}
		<input type="hidden" name="oldVehicleId" value={vehicle.vehicleId} />
		<input type="hidden" name="clientId" value={clientId} />
		<Label title="Cliente" error={windowState.error?.clientIdError} --column-end="span 3">
			<input class="client" list="clients" name="clientName" placeholder={clientPlaceholder} autocomplete="off" bind:value={search.value} />
			<datalist id="clients">
				{#each clients as client (client.id)}
					<option value={client.clientName}></option>
				{/each}
			</datalist>
		</Label>
	{/if}
	<Label title="Patente" error={windowState.error?.vehicleIdError}>
		<input class="plate" type="text" name="vehicleId" placeholder="-" autoComplete="off" value={vehicle?.vehicleId || ''} />
	</Label>
	<CarForm carModelProp={vehicle?.carModelId} --column-end="span 2" />
	<Label title="Año" --column-end="start">
		<input type="number" min="1900" max="9999" name="year" placeholder="-" autoComplete="off" value={vehicle?.year || ''} />
	</Label>
	<Label title="Cilindrada" --column-end="start">
		<input type="number" step="0.1" min="0" name="displacement" placeholder="-" autoComplete="off" value={vehicle?.displacement || ''} />
		<h6 class="unit">L</h6>
	</Label>
	<Label title="Combustible" --column-end="span 2">
		<select name="fuel" value={vehicle?.fuel || ''}>
			<option value="">-</option>
			<option value="Nafta">Nafta</option>
			<option value="Diesel">Diesel</option>
			<option value="GNC">GNC</option>
		</select>
	</Label>
	<Label title="VIN" --column-end="span 3" error={windowState.error?.vinError}>
		<input type="text" name="vin" placeholder="-" autoComplete="off" value={vehicle?.vin || ''} />
	</Label>
</Form>

<style>
	.client {
		text-transform: capitalize;
	}

	.plate {
		text-transform: uppercase;
		font-family: var(--font-family-alt);
	}
</style>
