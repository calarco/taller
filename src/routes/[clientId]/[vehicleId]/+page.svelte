<script>
	import { fly, blur } from 'svelte/transition';
	import { sineIn, sineOut } from 'svelte/easing';
	import { windowState } from '$lib/shared.svelte.js';
	import Section from '$lib/components/Section.svelte';
	import RepairForm from '$lib/components/repair/RepairForm.svelte';
	import RepairCard from '$lib/components/repair/RepairCard.svelte';

	let { data } = $props();

	let isCreate = $derived(windowState.activeCard === 'repair' && windowState.id === '');
</script>

<div class="panel" in:fly={{ y: '-1rem', duration: 300, easing: sineOut }} out:blur={{ amount: 32, duration: 250, easing: sineIn }}>
	{#key data.vehicle.vehicleId}
		<div class="container" in:fly={{ y: '-1rem', duration: 300, easing: sineOut }} out:blur={{ amount: 32, duration: 900, easing: sineIn }}>
			<Section overlay={windowState.activeCard === 'repair'} cards>
				<div class={["createButton", { isCreate }]}>
					{#if isCreate}
						<RepairForm/>
					{/if}
					<button type="button" onclick={() => {
						windowState.activeCard = 'repair';
						windowState.id = '';
					}}>
						<span class="icon create">reparacion</span>
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
		overflow: hidden;
		border-radius: 4px;
		background: var(--surface);
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
