<script>
	let { isActive, children } = $props();
</script>

<div class={['section-card', { isActive }]}>
	<div>
		{@render children()}
	</div>
</div>

<style>
	.section-card {
		&.isActive {
			position: sticky;
			top: 4.5rem;
			bottom: 0;
			z-index: var(--layer-card);

			> div {
				background: var(--primary-variant);
				outline: 1px solid var(--primary-border);
				box-shadow: var(--shadow-variant);
			}

			&:hover {
				cursor: default;
			}
		}

		> div {
			position: relative;
			border-radius: var(--border-radius);
			outline: 1px solid rgba(0, 0, 0, 0);
			transition:
				outline-color var(--duration-in) var(--ease-out),
				background-color var(--duration-out) var(--ease-out),
				z-index var(--duration-panel-out) step-end;
		}

		&:not(.isActive) > div:hover {
			transition: none;
			cursor: pointer;
			background: var(--highlight);
		}
	}
</style>
