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

	const currency = (value) => new Intl.NumberFormat('es-AR').format(value);

	const fontFamily = "'Supreme-Variable', 'Helvetica Neue', Helvetica, Arial, sans-serif";
	const rule = '1px solid rgba(128,128,128,0.2)';

	const text = { margin: '0', fontFamily };
	const table = { outline: rule };
	const label = { color: 'rgba(128,128,128,0.75)', fontWeight: 800, fontFamily };

	const hr = { borderColor: 'rgba(128,128,128,0.2)', margin: '1rem 0' };
	const section = { maxWidth: '100%', padding: '1rem', display: 'grid' };
	const plain = { maxWidth: '100%' };
	const title = { margin: '0', padding: '1.5rem', fontFamily };

	const cell = { padding: '0 1.5rem', fontFamily };
	const amountCell = { ...cell, minWidth: '100px' };
	const priceCell = { ...cell, minWidth: '150px' };

	const head = { ...cell, color: 'inherit', fontWeight: 'inherit' };
	const amountHead = { ...head, minWidth: '100px', borderRight: rule };
	const priceHead = { ...head, minWidth: '150px', borderLeft: rule };

	const inline = styleToString({ padding: '0 0.5rem' });
	const sign = styleToString({ padding: '0 0.25rem' });
</script>

<Html lang="en">
	<Head />
	<Preview preview={estimate.description} />
	<Section style={{ fontFamily }}>
		<Container align="center" style={section}>
			{#if user.description}
				<Heading as="h5" style={text}>
					{user.description}
				</Heading>
			{/if}
			<Heading as="h1" style={title}>
				{user.name || user.userId}
			</Heading>
			<Container align="center" style={plain}>
				<Text style={text}>
					{#if user.address}
						<span style={inline}>{user.address}</span>
					{/if}
					{#if user.phone}
						<span style={inline}>{user.phone}</span>
					{/if}
					{#if user.email}
						<span style={inline}>{user.email}</span>
					{/if}
				</Text>
			</Container>
		</Container>
		<Hr style={hr} />
		<Container align="center" style={section}>
			<Heading as="h4" style={text}>
				Presupuesto - {Intl.DateTimeFormat('es-AR', { year: 'numeric', month: 'long', day: 'numeric' }).format(estimate.createdAt)}
			</Heading>
			<Text style={{ margin: '1rem 0 0 0', fontFamily }}>
				{#if estimate.carModel}
					<span style={inline}>{estimate.carModel.carMake?.name} {estimate.carModel.name}</span>
				{/if}
				{#if estimate.vehicleId}
					<span style={inline}>{estimate.vehicleId}</span>
				{/if}
				{#if estimate.km}
					<span style={inline}>{currency(estimate.km)} km</span>
				{/if}
			</Text>
		</Container>
		<table style={styleToString({ padding: '1rem' })}>
			<tbody style={styleToString(table)}>
				<tr style={styleToString(label)}>
					<td align="left" colspan="2" width="100%">
						<Text style={head}>Reparación</Text>
					</td>
					<td align="right">
						<Text style={priceHead}>Mano de obra</Text>
					</td>
				</tr>
				<tr>
					<td align="left" colspan="2" width="100%">
						<Text style={cell}>{estimate.description}</Text>
					</td>
					<td align="right">
						<Text style={priceCell}><span style={sign}>$</span> {currency(estimate.labor)}</Text>
					</td>
				</tr>
			</tbody>
		</table>
		{#if estimate.parts.length}
			<table style={styleToString({ padding: '0 1rem' })}>
				<tbody style={styleToString(table)}>
					<tr style={styleToString(label)}>
						<td align="center">
							<Text style={amountHead}>Cantidad</Text>
						</td>
						<td align="left" width="100%">
							<Text style={head}>Repuesto</Text>
						</td>
						<td align="right">
							<Text style={priceHead}>Precio</Text>
						</td>
					</tr>
					{#each estimate.parts as part (part.name)}
						<tr>
							<td align="center">
								<Text style={amountCell}>{part.amount}</Text>
							</td>
							<td width="100%">
								<Text style={cell}>{part.name}</Text>
							</td>
							<td align="right">
								<Text style={priceCell}><span style={sign}>$</span> {currency(part.price)}</Text>
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
							<Text style={priceHead}>Total</Text>
						</td>
					</tr>
					<tr>
						<td align="left" colspan="2" width="100%"></td>
						<td align="right">
							<Text style={priceCell}><span style={sign}>$</span> {currency(estimate.labor + estimate.parts.reduce((a, { price }) => a + price, 0))}</Text>
						</td>
					</tr>
				</tbody>
			</table>
		{/if}
		<Hr style={hr} />
		<Container style={plain}>
			<Text align="right" style={{ width: '100%', padding: '0 2rem', fontFamily }}>
				© 2025 <Link href="https://calarco.com.ar">CalarcoWEB</Link>
			</Text>
		</Container>
	</Section>
</Html>
