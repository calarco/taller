<script>
	import { slide } from 'svelte/transition';
	import { sineIn, sineOut } from 'svelte/easing';
	import { page } from '$app/state';
	import { windowState, getCarName } from '$lib/shared.svelte.js';
	import Card from '$lib/components/Card.svelte';
	import Dialog from '$lib/components/Dialog.svelte';
	import VehicleForm from '$lib/components/vehicle/VehicleForm.svelte';

	let { vehicle } = $props();

	let isActive = $derived(page.url.pathname.split('/')[2] === vehicle.vehicleId);
	let dialog = $state();
</script>

{#snippet vehicleContent()}
	<article>
		{#if vehicle.vehicleId.length === 6}
			<h4 class="vehicleId">{vehicle.vehicleId.slice(0, 3)}<span>{vehicle.vehicleId.slice(3)}</span></h4>
		{:else if vehicle.vehicleId.length === 7}
			<h4 class="vehicleId">{vehicle.vehicleId.slice(0, 2)}<span>{vehicle.vehicleId.slice(2, 5)}</span><span>{vehicle.vehicleId.slice(-2)}</span></h4>
		{:else}
			<h4 class="vehicleId">{vehicle.vehicleId}</h4>
		{/if}
		<div class="subtitle">
			<h6>{getCarName(vehicle.carModelId)}</h6>
			{#if vehicle.year || vehicle.fuel || vehicle.displacement}
				<div>
					{#if vehicle.year}
						<p>{vehicle.year}</p>
					{/if}
					<span>{vehicle.fuel} {vehicle.displacement}{vehicle.displacement ? 'L' : ''}</span>
				</div>
			{/if}
		</div>
		<div class="details">
			{#if vehicle.vin}
				<div>
					<p>{vehicle.vin}</p>
					<div class="label">VIN</div>
				</div>
			{/if}
		</div>
	</article>
{/snippet}

<Card {isActive} isForm={windowState.activeCard === 'vehicle' && windowState.id === vehicle.vehicleId}>
	<a href={isActive ? `/${page.data.client.clientId}` : `/${page.data.client.clientId}/${vehicle.vehicleId}`}>
		{@render vehicleContent()}
	</a>
	{#if isActive}
		<div class="cardButtons" in:slide={{ axis: 'y', duration: 200, easing: sineOut }} out:slide={{ axis: 'y', duration: 150, easing: sineIn }}>
			<button type="button" onclick={() => dialog.showModal()} aria-label="borrar">
				<span class="icon delete"></span>
			</button>
			<button
				type="button"
				onclick={() => {
					windowState.activeCard = 'vehicle';
					windowState.id = vehicle.vehicleId;
				}}
				aria-label="editar"
			>
				<span class="icon edit"></span>
			</button>
		</div>
	{/if}
	{#if windowState.activeCard === 'vehicle' && windowState.id === vehicle.vehicleId}
		<VehicleForm {vehicle} />
	{/if}
	<Dialog bind:dialog title="¿Borrar vehiculo y sus reparaciones?" action="?/deleteVehicle">
		<input type="hidden" name="vehicleId" value={vehicle.vehicleId} />
		{@render vehicleContent()}
	</Dialog>
</Card>

<style>
	article {
		padding: 1rem 1.5rem;
		display: grid;
		gap: 1rem;
		grid-auto-flow: column;
		grid-template-columns: 5.75rem 1fr auto;
		gap: 1rem;
		align-items: center;

		.vehicleId {
			text-align: center;
			font-size: 1.1em;
		}

		.subtitle {
			display: grid;
			gap: 0.25rem;
			align-items: top;

			> div {
				p {
					margin-right: 0.25rem;
				}

				span {
					font: var(--label);
					color: var(--on-background-variant);
				}
			}
		}

		.details {
			display: grid;
			justify-items: end;
			gap: 0.5rem;
			user-select: text;

			> div {
				display: grid;
				grid-template-columns: 1fr auto;
				gap: 0.5rem 0.75rem;
				align-items: center;
			}
		}
	}
</style>
