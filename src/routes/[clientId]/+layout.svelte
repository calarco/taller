<script>
	import { fly, blur } from 'svelte/transition';
	import { sineIn, sineOut } from 'svelte/easing';
	import { windowState } from '$lib/shared.svelte.js';
	import Section from '$lib/components/Section.svelte';
	import VehicleForm from '$lib/components/vehicle/VehicleForm.svelte';
	import VehicleCard from '$lib/components/vehicle/VehicleCard.svelte';
	import ClientCard from '$lib/components/client/ClientCard.svelte';

	let { data, children } = $props();
	let isCreate = $derived(windowState.form === 'vehicle' && windowState.id === '');
</script>

<div class="panel" in:fly={{ y: '-1rem', duration: 300, easing: sineOut }} out:blur={{ amount: 32, duration: 250, easing: sineIn }}>
	{#key data.client.clientId}
		<div in:fly={{ y: '-1rem', duration: 300, easing: sineOut }} out:blur={{ amount: 32, duration: 900, easing: sineIn }}>
			<div class="vehiculos">
				<div>
					<Section overlay={windowState.form === 'vehicle' || windowState.form === 'client'} cards>
						<div class={['section-card', { isCreate }]}>
							{#if isCreate}
								<div style="position: relative">
									<VehicleForm />
								</div>
							{/if}
							<button
								type="button"
								class="createButton"
								onclick={() => {
									windowState.form = 'vehicle';
									windowState.id = '';
								}}
								aria-label="crear"
							>
								<div>
									<span class="icon vehicle"></span>
								</div>
								<span>Vehículo</span>
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
		position: relative;
		border-radius: 4px;
		border-top: 1px solid var(--border-variant);

		> div {
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
		}
	}

	.section-card {
		position: sticky;
		z-index: 100;
		top: 0;
		transition: z-index 0.35s step-end;

		&.isCreate {
			z-index: 1500;
			transition: z-index 0s;
			background: rgba(0, 0, 0, 0);
		}

		> button {
			width: 100%;
		}
	}
</style>
