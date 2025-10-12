<script>
	let { isActive, isForm, children } = $props();

	let element;
	$effect(() => {
		if (isForm && element?.getBoundingClientRect().y > 500) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	});
</script>

<div bind:this={element} class={['section-card', { isActive, isForm }]}>
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

		&.isForm {
			position: sticky;
			top: 4.5rem;
			z-index: 1500;
			transition:
				z-index 0s,
				background 0.4s cubic-bezier(0.895, 0.03, 0.685, 0.22);
			background: rgba(0, 0, 0, 0);

			&:not(:first-child)::after {
				border-bottom: 1px solid rgba(0, 0, 0, 0);
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
