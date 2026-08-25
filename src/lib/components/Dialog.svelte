<script>
	import { enhance } from '$app/forms';
	import { windowState } from '$lib/shared.svelte.js';
	import { enhanceSubmit } from '$lib/forms.js';

	let { dialog = $bindable(), title, actionText, action, disabled = false, children } = $props();

	let closing = $state(false);
	let closeTimer;
	let instance = $state(0);

	$effect(() => () => clearTimeout(closeTimer));

	function finishClose() {
		clearTimeout(closeTimer);
		if (dialog?.open) {
			dialog.close();
		}
		closing = false;
		instance += 1;
	}

	function requestClose() {
		if (!dialog?.open || closing) return;
		windowState.error = {};
		closing = true;
		clearTimeout(closeTimer);
		closeTimer = setTimeout(finishClose, 300);
	}

	function onanimationend(event) {
		if (event.target === dialog && closing) {
			finishClose();
		}
	}
</script>

<dialog
	bind:this={dialog}
	closedby="any"
	class={[{ save: actionText === 'Guardar' }, { closing }]}
	oncancel={(e) => {
		e.preventDefault();
		requestClose();
	}}
	{onanimationend}
>
	<div>
		<h4>{title}</h4>
		<form
			{action}
			method="POST"
			use:enhance={enhanceSubmit({
				reset: false,
				onResult: (result) => {
					if (result.type === 'success' || result.type === 'redirect') {
						requestClose();
					}
				},
			})}
		>
			{#if children}
				{#key instance}
					{@render children()}
				{/key}
			{/if}
			<div class="dialogButtons">
				<button type="button" onclick={requestClose}>Cancelar</button>
				<button type="submit" {disabled}>{actionText || 'Borrar'}</button>
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
		outline: 1px solid var(--border);
		background: var(--surface);
		box-shadow: var(--shadow);
		opacity: 0;
		filter: blur(1rem);
		transform: translateY(-1rem);

		> div {
			display: grid;

			> h4 {
				width: 100%;
				text-align: center;
				padding: 0.75rem 1rem;
				border-bottom: 1px solid var(--border);
			}

			> form {
				display: grid;
				align-items: stretch;
				grid-template-columns: var(--grid-columns, none);
			}
		}

		.dialogButtons {
			grid-column-start: 1;
			grid-column-end: span end;
			position: relative;
			width: 100%;
			height: 3rem;
			overflow: hidden;
			border-top: 1px solid var(--border);
			display: flex;
			gap: 1px;

			&:nth-child(1) {
				border-top: none;
			}

			button {
				width: 100%;
				height: 3rem;
				padding: 0 1.5rem;
				border-radius: 0px;
				background: none;
				border: none;
				text-transform: uppercase;

				&:focus {
					background: none;
				}

				&:not(:disabled):hover {
					cursor: pointer;
					background: var(--highlight);
				}

				&:not(:first-child)::after {
					content: '';
					position: absolute;
					top: 0;
					left: -1px;
					bottom: 0;
					border-left: 1px solid var(--border);
				}
			}

			button[type='submit']:not(:disabled) {
				color: var(--error);
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

					> button[type='submit']:not(:disabled) {
						color: var(--secondary);
					}
				}
			}
		}
	}

	dialog[open] {
		opacity: 1;
		filter: blur(0rem);
		transform: none;
		transition:
			opacity var(--duration-in) var(--ease-out),
			filter var(--duration-in) var(--ease-out),
			transform var(--duration-in) var(--ease-out);
	}

	@starting-style {
		dialog[open] {
			opacity: 0;
			filter: blur(1rem);
			transform: translateY(-1rem);
		}
	}

	dialog.closing {
		animation: dialog-out var(--duration-out) var(--ease-in) forwards;
	}

	dialog.closing::backdrop {
		animation: backdrop-out var(--duration-out) var(--ease-in) forwards;
	}

	@keyframes dialog-out {
		to {
			opacity: 0;
			filter: blur(1rem);
			transform: translateY(-1rem);
		}
	}

	@keyframes backdrop-out {
		to {
			opacity: 0;
		}
	}

	dialog::backdrop {
		background-color: var(--overlay);
		backdrop-filter: blur(0.5rem);
		opacity: 0;
	}

	dialog[open]::backdrop {
		opacity: 1;
		transition: opacity var(--duration-in) var(--ease-out);
	}

	@starting-style {
		dialog[open]::backdrop {
			opacity: 0;
		}
	}
</style>
