<script>
	let { vehicleId = '' } = $props();
</script>

{#if vehicleId.length === 6}
	<h4 class="plate">{vehicleId.slice(0, 3)}<span>{vehicleId.slice(-3)}</span></h4>
{:else if vehicleId.length === 7}
	<h4 class="plate">{vehicleId.slice(0, 2)}<span>{vehicleId.slice(2, 5)}</span><span>{vehicleId.slice(-2)}</span></h4>
{:else}
	<h4 class="plate">{vehicleId}</h4>
{/if}

<style>
	.plate {
		font-family: var(--font-family-alt);
		font-size: var(--font-size, 0.9em);
		text-align: var(--text-align, start);

		span {
			margin-left: 0.25rem;
			color: inherit;
		}
	}
</style>
