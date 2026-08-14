<script>
	import { fly, fade } from 'svelte/transition';
	import { enter, exit, flyEnter, flyExit } from '$lib/motion.js';

	let { title, error, isCreate, onCreate, showCreate, children } = $props();

	let hideError = $state(false);

	$effect(() => {
		if (error) {
			hideError = false;
		}
	});
</script>

<div class="field">
	<div class="titleRow">
		<span class="label">{title}</span>
		{#if error && !hideError}
			<div class="error" in:fly={flyEnter} out:fly={flyExit}>
				<button type="button" onclick={() => (hideError = true)} aria-label="ocultar el error">
					<span class="icon info"></span>
					{error}
				</button>
			</div>
		{/if}
		{#if showCreate}
			<div class="create" in:fade={enter} out:fade={exit}>
				<button type="button" onmousedown={(e) => e.preventDefault()} onclick={onCreate} aria-label={`Crear ${title}`}>
					<span class={['icon', 'create', { isCreate }]}></span>
				</button>
			</div>
		{/if}
	</div>
	<div class="control">
		{@render children()}
	</div>
</div>

<style>
	.field {
		grid-column-end: var(--column-end, span 1);
		flex-grow: 1;
		width: 100%;
		min-height: 5rem;
		padding: 0.5rem 1rem 0.75rem 1rem;
		background: var(--surface);
		display: grid;
		gap: 0.5rem;

		> .control {
			position: relative;
			min-height: 1.75rem;
			display: grid;
			gap: 0.75rem;
			grid-auto-flow: column;
			align-items: center;
			grid-template-columns: var(--template-columns, auto);
		}
	}

	.titleRow {
		position: relative;
		width: 100%;
		min-height: 1.75rem;
		display: grid;
		grid-auto-flow: column;
		justify-content: start;
		align-items: center;

		> .error {
			position: absolute;
			z-index: var(--layer-error);
			top: 0;
			bottom: 0;
			left: -1px;
			max-width: calc(100% + 1px);
			overflow: clip;
			border-radius: var(--border-radius);
			background: var(--error);
			display: grid;
			cursor: pointer;
			transition: transform var(--duration-fast) var(--ease-out);

			&:hover {
				transform: translateY(-2px);
			}

			> button {
				padding: 0 0.75rem 0 0.5rem;
				border: none;
				outline: none;
				width: max-content;
				display: grid;
				gap: 0.5rem;
				grid-auto-flow: column;
				align-items: center;
				text-transform: none;
				color: var(--on-foreground);
				font: var(--body2);
				font-size: 0.72rem;

				&:hover:not(:has(*:hover)),
				&:hover {
					background: none;
				}

				.icon.info::before {
					height: 1.25rem;
					width: 1.25rem;
					background: var(--on-foreground);
				}
			}
		}

		> .create {
			position: absolute;
			right: 0;
			top: 0;
			bottom: 0;
			border-radius: var(--border-radius);
			display: grid;
			cursor: pointer;
			transition: background-color var(--duration-fast) var(--ease-out);

			&:hover {
				background: var(--highlight);
				transition: none;
			}

			> button {
				padding: 0 0.5rem;

				&:disabled {
					opacity: 0.5;
				}

				&:hover:not(:has(*:hover)),
				&:hover {
					background: none;
				}

				.icon.create {
					transition: transform var(--duration-fast) var(--ease-out);

					&.isCreate {
						transform: rotate(45deg);
					}
				}
			}
		}
	}
</style>
