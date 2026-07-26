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
			z-index: 1000;

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
				outline 0.2s ease-in,
				background 0.15s ease-in,
				z-index 0.25s step-end;
		}

		&:not(.isActive) > div:hover {
			transition: background 0s;
			cursor: pointer;
			background: var(--highlight);
		}
	}
</style>
