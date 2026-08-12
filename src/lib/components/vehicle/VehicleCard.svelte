<script>
	import { slide } from 'svelte/transition';
	import { slideEnter, slideExit } from '$lib/motion.js';
	import { page } from '$app/state';
	import { openForm, openDialog } from '$lib/shared.svelte.js';
	import Card from '$lib/components/Card.svelte';
	import Dialog from '$lib/components/Dialog.svelte';
	import Plate from '$lib/components/vehicle/Plate.svelte';

	let { vehicle } = $props();

	let isActive = $derived(page.url.pathname.split('/')[2] === vehicle?.vehicleId);
	let dialog = $state();
</script>

{#snippet vehicleContent()}
	<article>
		<Plate vehicleId={vehicle?.vehicleId} --font-size="1.1em" --text-align="center" />
		<div class="subtitle">
			{#if vehicle?.carModel}
				<h6>{vehicle.carModel.carMake?.name} {vehicle.carModel.name}</h6>
			{/if}
			{#if vehicle?.year || vehicle?.fuel || vehicle?.displacement}
				<div>
					{#if vehicle?.year}
						<p>{vehicle.year}</p>
					{/if}
					<span>{vehicle?.fuel} {vehicle?.displacement}{vehicle?.displacement ? 'L' : ''}</span>
				</div>
			{/if}
		</div>
		<div class="details">
			{#if vehicle?.vin}
				<div>
					<p>{vehicle.vin}</p>
					<div class="label">VIN</div>
				</div>
			{/if}
		</div>
	</article>
{/snippet}

<Card {isActive}>
	<a href={isActive ? `/${page.data.client.clientId}` : `/${page.data.client.clientId}/${vehicle?.vehicleId}`}>
		{@render vehicleContent()}
	</a>
	{#if isActive}
		<div class="cardButtons" in:slide={slideEnter} out:slide={slideExit}>
			<button type="button" onclick={() => openDialog(dialog)} aria-label="borrar">
				<span class="icon delete"></span>
			</button>
			<button type="button" onclick={() => openForm('vehicle', vehicle?.vehicleId, vehicle)} aria-label="editar">
				<span class="icon edit"></span>
			</button>
		</div>
		<Dialog bind:dialog title="¿Borrar vehículo y sus reparaciones?" action="?/deleteVehicle">
			<input type="hidden" name="vehicleId" value={vehicle?.vehicleId} />
			{@render vehicleContent()}
		</Dialog>
	{/if}
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
