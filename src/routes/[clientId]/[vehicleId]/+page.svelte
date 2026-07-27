<script>
	import { fly, blur } from 'svelte/transition';
	import { panelBlurExit, panelFlyEnterX, panelFlyExitX } from '$lib/motion.js';
	import { windowState } from '$lib/shared.svelte.js';
	import Section from '$lib/components/Section.svelte';
	import RepairForm from '$lib/components/repair/RepairForm.svelte';
	import RepairCard from '$lib/components/repair/RepairCard.svelte';

	let { data } = $props();

	let isActive = $derived(windowState.form === 'repair');
</script>

<div class="panel" in:fly={panelFlyEnterX} out:blur={panelBlurExit}>
	{#key data.vehicle.vehicleId}
		<div class="container" in:fly={panelFlyEnterX} out:fly={panelFlyExitX}>
			<Section overlay={windowState.form === 'repair' || windowState.form === 'estimate'} cards>
				<div class={['section-card', { isActive }]}>
					{#if isActive}
						<div style="position: relative">
							<RepairForm repair={windowState.data} />
						</div>
					{/if}
					<button
						type="button"
						class="createButton"
						onclick={() => {
							windowState.form = 'repair';
							windowState.id = '';
							windowState.data = {};
						}}
						aria-label="crear"
					>
						<div>
							<span class="icon repair"></span>
						</div>
						<span>Reparación</span>
					</button>
				</div>
				{#each data.repairs as repair (repair.repairId)}
					<RepairCard {repair} />
				{/each}
				{#if !data.repairs?.length}
					<h5 class="empty">Sin reparaciones</h5>
				{/if}
			</Section>
		</div>
	{/key}
</div>

<style>
	.panel {
		grid-column-start: panel-right;
		grid-row-start: panel-top;
		pointer-events: none;
	}

	.container {
		pointer-events: auto;
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
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
