<script>
	import { enhance } from '$app/forms';
	import { windowState } from '$lib/shared.svelte.js';

	let { dialog = $bindable(), title, actionText, action, children } = $props();
</script>

<dialog bind:this={dialog} closedby="any">
	<h4>{title}</h4>
	<form
		{action}
		method="POST"
		use:enhance={() => {
			windowState.loading = true;
			return async ({ result, update }) => {
				update();
				windowState.loading = false;
				if (result.type === 'success' || result.type === 'redirect') {
					dialog.close();
				}
			};
		}}
	>
		{#if children}
			{@render children()}
		{/if}
		<div class="dialogButtons">
			<button type="button" onclick={() => dialog.close()}>Cancelar</button>
			<button type="submit" onclick={() => dialog.close()} class={[{ save: actionText === 'Guardar' }]}>{actionText || 'Borrar'}</button>
		</div>
	</form>
</dialog>

<style>
	dialog {
		min-width: 32rem;
		max-width: 47rem;
		padding: 0;
		border-radius: 4px;
		border: none;
		outline: var(--border-variant);
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

		> h4 {
			width: 100%;
			text-align: center;
			padding: 0.75rem 1rem;
			border-bottom: var(--border-variant);
		}

		.dialogButtons > .save {
			color: var(--secondary);
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
