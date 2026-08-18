<script>
	import { Body, Head, Html, Preview } from 'svelte-email';
	import Estimate from './Estimate.svelte';

	let { estimate, user } = $props();

	const fontFamily = "'Supreme-Variable', 'Helvetica Neue', Helvetica, Arial, sans-serif";
	const body = { margin: '0', padding: '0', fontFamily };
</script>

<Html lang="es">
	<Head />
	<Body style={body}>
		<Preview preview={estimate.description} />
		<Estimate {estimate} {user} />
	</Body>
</Html>
