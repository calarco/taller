<script>
	import { fly, fade } from 'svelte/transition';
	import { sineIn, sineOut } from 'svelte/easing';

	let { title, error, isCreate, onCreate, showCreate, children } = $props();

	let hideError = $state(false);
	$effect(() => {
		if (error) {
			hideError = false;
		}
	});
</script>

<label>
	<span class="label">
		{title}
		{#if error && !hideError}
			<div class="error" in:fly={{ y: '-1rem', duration: 200, easing: sineOut }} out:fly={{ y: '-1rem', duration: 150, easing: sineIn }}>
				<button
					tabindex="-1"
					type="button"
					onclick={(e) => {
						e.preventDefault();
						hideError = !hideError;
					}}
				>
					<span class="icon info"></span>
					{error}
				</button>
			</div>
		{/if}
		{#if showCreate}
			<div class="create" in:fade={{ duration: 200 }} out:fade={{ duration: 150 }}>
				<button type="button" onmousedown={onCreate} aria-label="crear">
					<span class={['icon', 'create', { isCreate }]}></span>
				</button>
			</div>
		{/if}
	</span>
	<div>
		{@render children()}
	</div>
</label>

<style>
	label {
		grid-column-end: var(--column-end, span 1);
		flex-grow: 1;
		width: 100%;
		min-height: 5rem;
		padding: 0.5rem 1rem 0.75rem 1rem;
		background: var(--surface);
		display: grid;
		gap: 0.5rem;

		> div {
			position: relative;
			min-height: 1.75rem;
			display: grid;
			gap: 0.75rem;
			grid-auto-flow: column;
			align-items: center;
			grid-template-columns: var(--template-columns, auto);
		}
	}

	.label {
		position: relative;
		font: inherit;
		color: inherit;
		margin: 0;
		width: 100%;
		min-height: 1.75rem;
		display: grid;
		grid-auto-flow: column;
		justify-content: start;
		align-items: center;

		> .error {
			position: absolute;
			z-index: 2000;
			top: 0;
			bottom: 0;
			left: -1px;
			border-radius: var(--border-radius);
			background: var(--error);
			display: grid;
			cursor: pointer;
			transition: transform 0.1s ease-out;

			&:hover {
				transform: translateY(-2px);
				transition: transform 0.15s ease-in;
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
				font-size: 0.96em;

				&:hover:not(:has(*:hover)),
				&:focus,
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
			transition: 0.1s ease-in;

			&:hover {
				background: var(--highlight);
				transition: 0.15s ease-out;
			}

			> button {
				padding: 0 0.5rem;

				&:disabled {
					opacity: 0.5;
				}

				&:hover:not(:has(*:hover)),
				&:focus,
				&:hover {
					background: none;
				}

				.icon.create {
					transition: transform 0.1s ease-in;

					&.isCreate {
						transition: transform 0.15s ease-out;
						transform: rotate(45deg);
					}
				}
			}
		}
	}
</style>
