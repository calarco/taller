<script>
	import { enhance } from '$app/forms';
	let { form } = $props();
</script>

<svelte:head>
	<title>Register</title>
</svelte:head>

<h1>Register</h1>

<div class="container">
	<form method="POST" autocomplete="off" use:enhance>
		<label>
			Usuario
			<input
				type="text"
				name="userId"
				autoComplete="username"
				value={form?.user?.userId ?? ""}
			/>
		</label>
		<label>
			Contraseña
			<input
				type="password"
				name="password"
				autoComplete="current-password"
			/>
		</label>
		<div class="buttons">
			<button
				type="submit"
			>
				Ingresar
			</button>
		</div>
	</form>
</div>

{#if form?.message}
	<p class="success">
		{form.message}
	</p>
{/if}

{#if form?.error}
	<p class="error">
		{form.error}
	</p>
{/if}

<style>
	.container {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: grid;
		justify-items: center;
		align-items: center;
		overflow: hidden;
		background: var(--overlay);
		backdrop-filter: blur(0.5rem);
	}

	form {
		position: relative;
		border-radius: 4px;
		border: 1px solid var(--primary);
		box-shadow: var(--shadow);
		background: var(--primary);
		display: grid;
		gap: 1px;
		align-items: start;

		label {
			height: 5rem;
			padding: 0.5rem 1rem 0.75rem 1rem;
			background: var(--surface);
			display: grid;
			align-content: space-between;
		}

		label:first-child {
			border-radius: 4px 4px 0 0;
		}
	}

	.buttons {
		width: 100%;
		height: 3rem;
		border-radius: 0 0 4px 4px;
		overflow: hidden;
		background: var(--surface);
		display: flex;
		transition: 0.25s ease-out;

		button {
			width: 100%;
			height: 3rem;
			margin: 0;
			padding: 0 1.5rem;
			border-radius: 0px;
			background: none;
			border: none;
		}
	}
</style>
