<script>
	import { fly, blur } from 'svelte/transition';
	import { sineIn, sineOut } from 'svelte/easing';
	import { windowState } from '$lib/shared.svelte.js';
	import Section from '$lib/components/Section.svelte';
	import RepairForm from '$lib/components/repair/RepairForm.svelte';
	import RepairCard from '$lib/components/repair/RepairCard.svelte';

	let { data } = $props();

	let isCreate = $derived(windowState.form === 'repair' && windowState.id === '');
</script>

<div class="panel" in:fly={{ x: '-1rem', duration: 300, easing: sineOut }} out:blur={{ amount: 32, duration: 250, easing: sineIn }}>
	{#key data.vehicle.vehicleId}
		<div class="container" in:fly={{ x: '-1rem', duration: 300, easing: sineOut }} out:blur={{ amount: 32, duration: 900, easing: sineIn }}>
			<Section overlay={windowState.form === 'repair' || windowState.form === 'estimate'} cards>
				<div class={['section-card', { isCreate }]}>
					{#if isCreate}
						<div style="position: relative">
							<RepairForm />
						</div>
					{/if}
					<button
						type="button"
						class="createButton"
						onclick={() => {
							windowState.form = 'repair';
							windowState.id = '';
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
		z-index: 600;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
	}

	.section-card {
		position: sticky;
		top: 0;
		z-index: 100;
		transition: z-index 0.35s step-end;
		padding: 1rem 0 0.5rem 0;

		&.isCreate {
			z-index: 1500;
			transition:
				z-index 0s,
				background 0.4s cubic-bezier(0.895, 0.03, 0.685, 0.22);
			background: rgba(0, 0, 0, 0);
		}

		> button {
			width: 100%;
		}
	}
</style>
