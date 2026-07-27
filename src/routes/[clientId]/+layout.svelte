<script>
	import { fly, blur } from 'svelte/transition';
	import { panelBlurExit, panelFlyEnterX, panelFlyExitX } from '$lib/motion.js';
	import { windowState } from '$lib/shared.svelte.js';
	import Section from '$lib/components/Section.svelte';
	import VehicleForm from '$lib/components/vehicle/VehicleForm.svelte';
	import VehicleCard from '$lib/components/vehicle/VehicleCard.svelte';
	import ClientCard from '$lib/components/client/ClientCard.svelte';

	let { data, children } = $props();
	let isActive = $derived(windowState.form === 'vehicle');
</script>

<div class="panel" in:fly={panelFlyEnterX} out:blur={panelBlurExit}>
	{#key data.client.clientId}
		<div in:fly={panelFlyEnterX} out:fly={panelFlyExitX}>
			<div class="vehiculos">
				<div>
					<Section overlay={windowState.form === 'vehicle' || windowState.form === 'client'} cards>
						<div class={['section-card', { isActive }]}>
							{#if isActive}
								<div style="position: relative">
									<VehicleForm vehicle={windowState.data} />
								</div>
							{/if}
							<button
								type="button"
								class="createButton"
								onclick={() => {
									windowState.form = 'vehicle';
									windowState.id = '';
									windowState.data = {};
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
		grid-column-start: panel-left;
		grid-row-start: panel-top;

		> div {
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
			border-radius: var(--border-radius);
			background: var(--surface-variant);
			display: grid;
			grid-template-rows: auto 1fr;
		}
	}

	.vehiculos {
		position: relative;
		border-radius: var(--border-radius);
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
		top: 0;
		z-index: var(--layer-sticky);
		transition: z-index var(--duration-panel-out) step-end;
		padding: 1rem 0 0.5rem 0;

		&.isActive {
			z-index: var(--layer-form);
			transition: none;
		}

		> button {
			width: 100%;
		}
	}
</style>
