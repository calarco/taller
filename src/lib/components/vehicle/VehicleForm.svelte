<script>
	import { windowState } from '$lib/shared.svelte.js';
	import Form from '$lib/components/Form.svelte';
	import Label from '$lib/components/Label.svelte';
	import CarForm from '$lib/components/CarForm.svelte';

	let { vehicle } = $props();
</script>

<Form action="?/upsertVehicle" --grid-columns="1fr [start] 1fr 1fr [end]">
	{#if vehicle?.vehicleId}
		<input type="hidden" name="vehicleId" value={vehicle.vehicleId} />
	{/if}
	<Label title="Patente" error={windowState.error?.vehicleIdError}>
		<input class="patente" type="text" name="vehicleId" placeholder="-" autoComplete="off" disabled={vehicle?.vehicleId} value={vehicle?.vehicleId || ''} />
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
	.patente {
		text-transform: uppercase;
		font-family: var(--font-family-alt);
	}
</style>
