import * as deepslate from 'deepslate';
import { drawValues } from './drawing.svelte';
import type { ValueLookupFn } from './types';

export type PreviewFn = (
	canvas: HTMLCanvasElement,
	value: object,
	random: deepslate.Random,
	size: {
		height: number;
		width: number;
		scale: number;
		dpr: number;
		origin: { x: number; y: number };
	}
) => ValueLookupFn;

export const densityFunctionPreview: PreviewFn = (canvas, value, random, size) => {
	let origFn = deepslate.DensityFunction.fromJson(value);
	if (origFn instanceof deepslate.DensityFunction.Noise) {
		const noise = new deepslate.NormalNoise(random, origFn.noiseData.value());
		origFn = new deepslate.DensityFunction.Noise(
			origFn.xzScale,
			origFn.yScale,
			origFn.noiseData,
			noise
		);
	}

	drawValues(
		(pixelX, pixelY) => {
			return origFn.compute(deepslate.DensityFunction.context(pixelX, pixelY, 0));
		},
		canvas,
		size
	);

	return (({ x, y }) => ({
		label: 'Density',
		value: origFn.compute(deepslate.DensityFunction.context(x, y, 0)).toFixed(6)
	})) satisfies ValueLookupFn;
};

export const noisePreview: PreviewFn = (canvas, value, random, size) => {
	const normalNoise = new deepslate.NormalNoise(random, value as any);
	drawValues((pixelX, pixelY) => normalNoise.sample(pixelX, pixelY, 0), canvas, size);
	return (({ x, y }) => ({
		label: 'Noise',
		value: normalNoise.sample(x, y, 0).toFixed(2)
	})) satisfies ValueLookupFn;
};
