<script>
	import { Container, Head, Heading, Hr, Html, Link, Preview, Text, Section } from 'svelte-email';

	let { estimate, user } = $props();

	const styleToString = (style) => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) {
				return str;
			}
			return str + key + ':' + style[key] + ';';
		}, '');
	};

	const text = {
		margin: '0',
	};

	const table = {
		outline: '1px solid rgba(128,128,128,0.2)',
	};

	const label = {
		color: 'rgba(128,128,128,0.75)',
		fontWeight: 800,
	};
</script>

<Html lang="en">
	<Head />
	<Preview preview={estimate.description} />
	<Section style={{ backgroundColor: '#ff0000' }}>
		<Container align="center" style={{ maxWidth: '100%', padding: '1rem', display: 'grid' }}>
			{#if user.description}
				<Heading as="h5" style={text}>
					{user.description}
				</Heading>
			{/if}
			<Heading as="h1" style={{ margin: '0', padding: '1.5rem' }}>
				{user.name || user.userId}
			</Heading>
			<Container align="center" style={{ maxWidth: '100%' }}>
				<Text style={text}>
					{#if user.address}
						<span style={styleToString({ padding: '0 0.5rem' })}>{user.address}</span>
					{/if}
					{#if user.phone}
						<span style={styleToString({ padding: '0 0.5rem' })}>{user.phone}</span>
					{/if}
					{#if user.email}
						<span style={styleToString({ padding: '0 0.5rem' })}>{user.email}</span>
					{/if}
				</Text>
			</Container>
		</Container>
		<Hr style={{ borderColor: 'rgba(128,128,128,0.2)', margin: '1rem 0' }} />
		<Container align="center" style={{ maxWidth: '100%', padding: '1rem', display: 'grid' }}>
			<Heading as="h4" style={text}>
				Presupuesto - {Intl.DateTimeFormat('es-AR', { year: 'numeric', month: 'long', day: 'numeric' }).format(estimate.createdAt)}
			</Heading>
			<Text style={{ margin: '1rem 0 0 0' }}>
				{#if estimate.carModel}
					<span style={styleToString({ padding: '0 0.5rem' })}>{estimate.carModel.carMake?.name} {estimate.carModel.name}</span>
				{/if}
				{#if estimate.vehicleId}
					<span style={styleToString({ padding: '0 0.5rem' })}>{estimate.vehicleId}</span>
				{/if}
				{#if estimate.km}
					<span style={styleToString({ padding: '0 0.5rem' })}>{new Intl.NumberFormat('es-AR').format(estimate.km)} km</span>
				{/if}
			</Text>
		</Container>
		<table style={styleToString({ padding: '1rem' })}>
			<tbody style={styleToString(table)}>
				<tr style={styleToString(label)}>
					<td align="left" colspan="2" width="100%">
						<Text style={{ padding: '0 1.5rem', color: 'inherit', fontWeight: 'inherit' }}>Reparación</Text>
					</td>
					<td align="right">
						<Text style={{ padding: '0 1.5rem', color: 'inherit', fontWeight: 'inherit', minWidth: '150px', borderLeft: '1px solid rgba(128,128,128,0.2)' }}>Mano de obra</Text>
					</td>
				</tr>
				<tr>
					<td align="left" colspan="2" width="100%">
						<Text style={{ padding: '0 1.5rem' }}>{estimate.description}</Text>
					</td>
					<td align="right">
						<Text style={{ padding: '0 1.5rem', minWidth: '150px' }}><span style={styleToString({ padding: '0 0.25rem' })}>$</span> {new Intl.NumberFormat('es-AR').format(estimate.labor)}</Text>
					</td>
				</tr>
			</tbody>
		</table>
		{#if estimate.parts.length}
			<table style={styleToString({ padding: '0 1rem' })}>
				<tbody style={styleToString(table)}>
					<tr style={styleToString(label)}>
						<td align="center">
							<Text style={{ padding: '0 1.5rem', color: 'inherit', fontWeight: 'inherit', minWidth: '100px', borderRight: '1px solid rgba(128,128,128,0.2)' }}>Cantidad</Text>
						</td>
						<td align="left" width="100%">
							<Text style={{ padding: '0 1.5rem', color: 'inherit', fontWeight: 'inherit' }}>Repuesto</Text>
						</td>
						<td align="right">
							<Text style={{ padding: '0 1.5rem', color: 'inherit', fontWeight: 'inherit', minWidth: '150px', borderLeft: '1px solid rgba(128,128,128,0.2)' }}>Precio</Text>
						</td>
					</tr>
					{#each estimate.parts as part (part.name)}
						<tr>
							<td align="center">
								<Text style={{ padding: '0 1.5rem', minWidth: '100px' }}>{part.amount}</Text>
							</td>
							<td width="100%">
								<Text style={{ padding: '0 1.5rem' }}>{part.name}</Text>
							</td>
							<td align="right">
								<Text style={{ padding: '0 1.5rem', minWidth: '150px' }}><span style={styleToString({ padding: '0 0.25rem' })}>$</span> {new Intl.NumberFormat('es-AR').format(part.price)}</Text>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
			<table style={styleToString({ padding: '1rem' })}>
				<tbody style={styleToString(table)}>
					<tr style={styleToString(label)}>
						<td align="left" colspan="2" width="100%"></td>
						<td align="right">
							<Text style={{ padding: '0 1.5rem', color: 'inherit', fontWeight: 'inherit', minWidth: '150px', borderLeft: '1px solid rgba(128,128,128,0.2)' }}>Total</Text>
						</td>
					</tr>
					<tr>
						<td align="left" colspan="2" width="100%"></td>
						<td align="right">
							<Text style={{ padding: '0 1.5rem', minWidth: '150px' }}
								><span style={styleToString({ padding: '0 0.25rem' })}>$</span> {new Intl.NumberFormat('es-AR').format(estimate.labor + estimate.parts.reduce((a, { price }) => a + price, 0))}</Text
							>
						</td>
					</tr>
				</tbody>
			</table>
		{/if}
		<Hr style={{ borderColor: 'rgba(128,128,128,0.2)', margin: '1rem 0' }} />
		<Container style={{ maxWidth: '100%' }}>
			<Text align="right" style={{ width: '100%', padding: '0 2rem' }}>
				© 2025 <Link href="https://calarco.com.ar">CalarcoWEB</Link>
			</Text>
		</Container>
	</Section>
</Html>

<style>
</style>
