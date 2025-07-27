<script>
	import { page } from '$app/state';
	import { windowState } from '$lib/shared.svelte.js';
	import Form from '$lib/components/Form.svelte';
	import Label from '$lib/components/Label.svelte';
	import CarForm from '$lib/components/CarForm.svelte';

	let { vehicle } = $props();

	let value = $state('');
	let search = $state(page.data.search);
	let clientId = $state('');
	$effect(() => {
		if (value) {
			(async () => {
				windowState.loading = true;
				const response = await fetch('/search/' + value);
				const data = await response.json();
				if (data?.length) {
					search = data;
				} else {
					search = [];
				}
				const client = search.find((x) => x.clientName === value);
				if (client) {
					clientId = client.clientId;
				}
				windowState.loading = false;
			})();
		} else {
			search = page.data.search;
		}
	});
</script>

<Form action="?/upsertVehicle" --grid-columns="1fr [start] 1fr 1fr [end]">
	{#if vehicle?.vehicleId}
		<input type="hidden" name="oldVehicleId" value={vehicle.vehicleId} />
		<input type="hidden" name="clientId" value={clientId} />
		<Label title="Cliente" error={windowState.error?.clientIdError} --column-end="span 3">
			<input class="client" list="clients" name="clientName" placeholder={page.data.client.name + ' ' + page.data.client.lastName} autoComplete="off" bind:value />
			<datalist id="clients">
				{#each search as client (client.id)}
					<option key={client.clientId} value={client.clientName}></option>
				{/each}
			</datalist>
		</Label>
	{/if}
	<Label title="Patente" error={windowState.error?.vehicleIdError}>
		<input class="patente" type="text" name="vehicleId" placeholder="-" autoComplete="off" value={vehicle?.vehicleId || ''} />
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
		<select name="fuel" autoComplete="off" value={vehicle?.fuel || ''}>
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

	.patente {
		text-transform: uppercase;
		font-family: var(--font-family-alt);
	}
</style>
