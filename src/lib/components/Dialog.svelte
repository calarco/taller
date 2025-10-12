<script>
	import { enhance } from '$app/forms';
	import { windowState } from '$lib/shared.svelte.js';

	let { dialog = $bindable(), title, actionText, action, children } = $props();
</script>

<dialog bind:this={dialog} closedby="any" class={[{ save: actionText === 'Guardar' }]}>
	<div>
		<h4>{title}</h4>
		<form
			{action}
			method="POST"
			use:enhance={() => {
				windowState.loading = true;
				windowState.error = {};
				return async ({ result, update }) => {
					update({ reset: false });
					windowState.loading = false;
					if (result.type === 'success' || result.type === 'redirect') {
						dialog.close();
					}
					if (result.type === 'failure' && result.data) {
						windowState.error = result.data;
					}
				};
			}}
		>
			{#if children}
				{@render children()}
			{/if}
			<div class="dialogButtons">
				<button type="button" onclick={() => dialog.close()}>Cancelar</button>
				<button type="submit">{actionText || 'Borrar'}</button>
			</div>
		</form>
	</div>
</dialog>

<style>
	dialog {
		min-width: var(--min-width, 32rem);
		max-width: 47rem;
		padding: 0;
		border-radius: var(--border-radius);
		border: none;
		outline: 1px solid var(--border-variant);
		background: var(--surface);
		box-shadow: var(--shadow);
		opacity: 0;
		filter: blur(2rem);
		transition:
			opacity 0.2s ease-in,
			filter 0.2s ease-in,
			transform 0.2s ease-in,
			overlay 0.2s ease-in allow-discrete,
			display 0.2s ease-in allow-discrete;

		> div {
			display: grid;

			> h4 {
				width: 100%;
				text-align: center;
				padding: 0.75rem 1rem;
				border-bottom: 1px solid var(--border-variant);
			}

			> form {
				display: grid;
				align-items: stretch;
				grid-template-columns: var(--grid-columns);
			}
		}

		&.save {
			outline: 1px solid var(--primary);
			background: var(--primary);

			> div {
				gap: 1px;

				> h4 {
					background: var(--surface);
					border-bottom: none;
				}

				> form {
					gap: 1px;
				}

				.dialogButtons {
					background: var(--surface);
					border-top: none;

					> button[type='submit'] {
						color: var(--secondary);
					}
				}
			}
		}
	}

	dialog:open {
		opacity: 1;
		filter: blur(0rem);
		transform: initial;
		transition:
			opacity 0.3s ease-out,
			filter 0.3s ease-out,
			transform 0.3s ease-out,
			overlay 0.3s ease-out allow-discrete,
			display 0.3s ease-out allow-discrete;
	}

	@starting-style {
		dialog:open {
			opacity: 0;
			transform: translateY(-1rem);
		}
	}

	dialog::backdrop {
		background-color: rgb(0 0 0 / 0%);
		transition:
			display 0.2s ease-in allow-discrete,
			overlay 0.2s ease-in allow-discrete,
			background-color 0.2s;
	}

	dialog:open::backdrop {
		background-color: var(--overlay);
		backdrop-filter: blur(0.4rem);
		transition:
			display 0.3s ease-out allow-discrete,
			overlay 0.3s ease-out allow-discrete,
			background-color 0.3s;
	}

	@starting-style {
		dialog:open::backdrop {
			background-color: rgb(0 0 0 / 0%);
		}
	}
</style>
