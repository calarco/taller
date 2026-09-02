<script>
	let { year, month } = $props();
</script>

<div class="month">
	<h6>{year}</h6>
	<h4>
		{new Date(year, month, 1).toLocaleDateString('es-AR', { month: 'long' })}
	</h4>
</div>

<style>
	.month {
		position: sticky;
		z-index: var(--layer-sticky);
		top: -1px;
		margin-top: -1px;
		width: 100%;
		min-height: calc(3rem + 1px);
		padding: 0.5rem 1.25rem;
		outline: 1px solid var(--border);
		background: var(--surface);
		box-shadow: var(--shadow-variant);
		display: grid;
		gap: 1.75rem;
		grid-auto-flow: column;
		align-items: center;
		justify-content: start;
		text-transform: capitalize;

		h6 {
			color: var(--on-background-variant);
		}
	}
</style>
