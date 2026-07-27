import { sineIn, sineOut } from 'svelte/easing';

export const enter = { duration: 200, easing: sineOut };
export const exit = { duration: 150, easing: sineIn };
export const panelEnter = { duration: 300, easing: sineOut };
export const panelExit = { duration: 250, easing: sineIn };

export const flyEnter = { y: '-1rem', ...enter };
export const panelFlyEnter = { y: '-1rem', ...panelEnter };
export const panelFlyEnterX = { x: '-1rem', ...panelEnter };
export const panelFlyExit = { y: '1rem', ...panelExit };
export const panelFlyExitX = { x: '1rem', ...panelExit };

export const blurEnter = { amount: 16, ...enter };
export const blurExit = { amount: 16, ...exit };
export const panelBlurExit = { amount: 16, ...panelExit };

export const slideEnter = { axis: 'y', ...enter };
export const slideExit = { axis: 'y', ...exit };
