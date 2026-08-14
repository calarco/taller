<script>
	import { fly, blur } from 'svelte/transition';
	import { page } from '$app/state';
	import { panelBlurExit, panelFlyEnterX, panelFlyExitX } from '$lib/motion.js';
	import { windowState, openForm } from '$lib/shared.svelte.js';
	import Section from '$lib/components/Section.svelte';
	import RepairForm from '$lib/components/repair/RepairForm.svelte';
	import RepairCard from '$lib/components/repair/RepairCard.svelte';

	let { data } = $props();

	let isActive = $derived(windowState.form === 'repair');
</script>

<div class="panel" in:fly={panelFlyEnterX} out:blur={panelBlurExit}>
	{#key page.params.vehicleId}
		<div class="panelFill" in:fly={panelFlyEnterX} out:fly={panelFlyExitX}>
			<Section overlay={windowState.form === 'repair' || windowState.form === 'estimate'} cards>
				<div class={['sectionCard', { isActive }]}>
					{#if isActive}
						<div style="position: relative">
							<RepairForm repair={windowState.data} />
						</div>
					{/if}
					<button type="button" class="createButton" onclick={() => openForm('repair')}>
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

	.panelFill {
		pointer-events: auto;
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
	}

	.sectionCard {
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
