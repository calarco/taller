export const MONTHS_PER_BLOCK = 6;
export const PAGE_AMOUNT = 50;

export function onVisible(node, callback) {
	let onIntersect = callback;
	const observer = new IntersectionObserver(
		(entries) => {
			if (!entries[0].isIntersecting) {
				return;
			}
			const scroller = node.closest('.scroller');
			if (scroller && scroller.scrollHeight <= scroller.clientHeight) {
				return;
			}
			onIntersect?.();
		},
		{ root: null, rootMargin: '20px', threshold: 0 }
	);
	observer.observe(node);

	return {
		update(next) {
			onIntersect = next;
		},
		destroy() {
			observer.disconnect();
		},
	};
}
