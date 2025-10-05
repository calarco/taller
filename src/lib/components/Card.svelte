<script>
	import { slide } from 'svelte/transition';
	import { sineIn, sineOut } from 'svelte/easing';

	let { isActive, isForm, children } = $props();

	let element;
	$effect(() => {
		if (isForm && element?.getBoundingClientRect().y > 550) {
			element.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	});
</script>

<div bind:this={element} class={['container', { isActive, isForm }]} in:slide={{ axis: 'y', duration: 200, easing: sineOut }} out:slide={{ axis: 'y', duration: 150, easing: sineIn }}>
	{@render children()}
</div>

<style>
	.container {
		z-index: 1;
		position: relative;
		border-radius: 4px;
		border: 1px solid rgba(0, 0, 0, 0);
		transition:
			border 0.2s ease-in,
			background 0.15s ease-in,
			z-index 0.25s step-end;

		&:hover {
			transition: background 0s;
			cursor: pointer;
			background: var(--primary-variant);
		}

		&:not(:first-child)::after {
			content: '';
			position: absolute;
			top: calc(-0.5rem - 1px);
			z-index: 0;
			width: 100%;
			border-top: var(--border-variant);
		}

		&.isActive {
			position: sticky;
			top: 4rem;
			z-index: 1000;
			background: var(--primary-variant);
			backdrop-filter: var(--backdrop-filter);
			border: 1px solid var(--primary-variant);
			box-shadow: var(--shadow-variant);

			&:hover {
				cursor: default;
			}
		}

		&.isForm {
			position: sticky;
			top: 4rem;
			z-index: 1500;
			backdrop-filter: none;
			transition: z-index 0s;

			&:not(:first-child)::after {
				border-top: 1px solid rgba(0, 0, 0, 0);
			}
		}
	}
</style>
