import { sineIn, sineOut } from 'svelte/easing';

export const enter = { y: '-1rem', amount: 16, axis: 'y', duration: 200, easing: sineOut };
export const exit = { y: '-1rem', amount: 16, axis: 'y', duration: 150, easing: sineIn };
export const panelEnter = { ...enter, duration: 300 };
export const panelExit = { ...exit, duration: 250 };

export function blurFly(node, { delay = 0, duration, easing, y = 0, amount = 0, opacity = 0 } = {}) {
	const style = getComputedStyle(node);
	const target = +style.opacity;
	const transform = style.transform === 'none' ? '' : style.transform;
	const filter = style.filter === 'none' ? '' : style.filter;
	const od = target * (1 - opacity);
	return {
		delay,
		duration,
		easing,
		css: (t, u) => `transform: ${transform} translateY(calc(${u} * ${y})); filter: ${filter} blur(${u * amount}px); opacity: ${target - od * u};`,
	};
}
