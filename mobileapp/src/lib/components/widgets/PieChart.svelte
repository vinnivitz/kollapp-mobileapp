<script lang="ts">
	/* eslint-disable security/detect-object-injection, sonarjs/reduce-initial-value */
	import { arc, interpolate, pie, select } from 'd3';
	import { onMount } from 'svelte';

	const data = [10, 60, 30];
	const width = 150;
	const height = 150;
	const radius = Math.min(width, height) / 2;
	let svgElement: SVGSVGElement;

	onMount(() => {
		const svg = select(svgElement)
			.attr('width', width)
			.attr('height', height)
			.append('g')
			.attr('transform', `translate(${width / 2}, ${height / 2})`);

		const pieGen = pie().value((d) => (typeof d === 'number' ? d : d.valueOf()));
		const arcGen = arc().innerRadius(0).outerRadius(radius);
		const arcs = pieGen(data);

		svg
			.selectAll('path')
			.data(arcs)
			.enter()
			.append('path')
			.attr('fill', (_, index) => ['#f00', '#0c0', '#00f'][index] ?? '#000')
			.attr('d', (d) => arcGen({ ...d, innerRadius: 0, outerRadius: 0 })) // start collapsed
			.transition()
			.duration(1000)
			.attrTween('d', (d) => {
				const index = interpolate({ endAngle: 0, startAngle: 0 }, d);
				return (t) => arcGen({ ...index(t), innerRadius: 0, outerRadius: radius }) || '';
			});

		svg
			.selectAll('text')
			.data(arcs)
			.enter()
			.append('text')
			.text((d) => `${Math.round((Number(d.data) / data.reduce((a, b) => a + b)) * 100)}%`)
			.attr('fill', '#fff')
			.attr('font-size', '10px')
			.attr('text-anchor', 'middle')
			.attr('dy', '0.35em') // vertical alignment
			.attr('transform', (d) => {
				const [x, y] = arcGen.centroid({ ...d, innerRadius: 0, outerRadius: radius });
				return `translate(${x}, ${y})`;
			});
	});
</script>

<svg bind:this={svgElement}></svg>
