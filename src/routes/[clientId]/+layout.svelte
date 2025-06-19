<script>
	import { fly, blur } from 'svelte/transition';
	import { sineIn, sineOut } from 'svelte/easing';
	import { windowState } from '$lib/shared.svelte.js';
	import Section from '$lib/components/Section.svelte';
	import VehicleForm from '$lib/components/vehicle/VehicleForm.svelte';
	import VehicleCard from '$lib/components/vehicle/VehicleCard.svelte';
	import ClientCard from '$lib/components/client/ClientCard.svelte';

	let { data, children } = $props();
	let isCreate = $derived(windowState.activeCard === 'vehicle' && windowState.id === '');
</script>

<div class="panel" in:fly={{ y: '-1rem', duration: 300, easing: sineOut }} out:blur={{ amount: 32, duration: 250, easing: sineIn }}>
	{#key data.client.clientId}
		<div in:fly={{ y: '-1rem', duration: 300, easing: sineOut }} out:blur={{ amount: 32, duration: 900, easing: sineIn }}>
			<div class="vehiculos">
				<Section overlay={windowState.activeCard === 'vehicle' || windowState.activeCard === 'client'} cards>
					<div class={['createButton', { isCreate }]}>
						{#if isCreate}
							<VehicleForm />
						{/if}
						<button
							type="button"
							onclick={() => {
								windowState.activeCard = 'vehicle';
								windowState.id = '';
							}}
						>
							<span class="icon create">vehiculo</span>
						</button>
					</div>
					{#if !data.vehicles?.length}
						<h5 class="empty">Sin vehiculos</h5>
					{/if}
					{#each data.vehicles as vehicle (vehicle.vehicleId)}
						<VehicleCard {vehicle} />
					{/each}
				</Section>
			</div>
			<ClientCard />
		</div>
	{/key}
</div>
{@render children()}

<style>
	.panel {
		z-index: 1000;
		grid-column-start: panel-left;
		grid-row-start: panel-top;

		> div {
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
			border-radius: 4px;
			background: var(--surface-variant);
			display: grid;
			grid-template-rows: auto 1fr;
		}
	}

	.vehiculos {
		overflow: hidden;
		border-radius: 4px;
		background: var(--surface);
		border-top: var(--border-variant);
		box-shadow: var(--shadow);
	}

	.createButton {
		position: sticky;
		top: 0;
		height: 3rem;
		padding: 0 0 3rem 0;
		border-radius: 4px;
		border: 1px solid var(--secondary-variant);
		background: var(--secondary-variant);
		backdrop-filter: var(--backdrop-filter);
		color: var(--secondary);
		z-index: 100;
		transition: z-index 0.35s step-end;

		&.isCreate {
			z-index: 1500;
			transition: z-index 0s;
		}

		&:hover {
			cursor: pointer;
		}

		> button {
			position: relative;
			width: 100%;
			height: 3rem;
			overflow: hidden;
			color: inherit;

			.icon.create {
				padding-right: 0.5rem;

				&::before {
					background: var(--secondary);
				}
			}
		}
	}
</style>
