import * as deepslate from 'deepslate';
import { parse } from 'valibot';
import { DeepslateRenderWorkerMessageSchema, type Point } from './proto';
import { viridis } from './viridis';
import { coordinateToPixel, pixelToCoordinate } from './lib';

declare var self: DedicatedWorkerGlobalScope;
export {}; // Make it a module if not already one

let canvas: OffscreenCanvas;
let ctx: OffscreenCanvasRenderingContext2D;
let seed: [bigint, bigint];
let random: deepslate.Random;
let updateFn: (value: object) => void;

let pointValFn: ((point: Point) => number) | undefined;
let memo: Map<[number, number], number> = new Map();
const getVal = (p: Point): number | null => {
	if (!pointValFn) return null;
	if (memo.has([p.x, p.y])) {
		return memo.get([p.x, p.y])!;
	}
	const res = pointValFn(p);
	memo.set([p.x, p.y], res);
	return res;
};

let value: object;
let pointValLabel: string = '';

// View Configuration
let scale = 32; // 32 pixels -> 1 block
let origin = { x: 0, y: 0 };
let worldHeight: number;
let minY: number;
let markerPosition: Point | null = null;

const reseed = () => {
	seed = [BigInt(Math.floor(performance.now())), BigInt(Math.floor(performance.timeOrigin))] as [
		bigint,
		bigint
	];
	random = new deepslate.XoroshiroRandom(seed);
};
reseed();
const reset = () => {
	random = new deepslate.XoroshiroRandom(seed);
};

const drawAtCoords = (worldBounded = false) => {
	// TODO: We are doing a bit of overdraw here to make sure that we cover the whole canvas -- might want to fix that
	const maxY = minY + worldHeight;
	const yInBounds = (y: number) => {
		if (!worldBounded) return true;

		return y >= minY && y < maxY;
	};
	requestAnimationFrame(() => {
		ctx.reset();

		for (let xPixel = 0; xPixel <= canvas.width; xPixel += scale) {
			for (let yPixel = 0; yPixel <= canvas.height; yPixel += scale) {
				const coord = pixelToCoordinate(
					{ x: xPixel, y: yPixel },
					origin,
					{ w: canvas.width, h: canvas.height },
					scale
				);

				if (yInBounds(coord.y)) {
					const value = getVal(coord);
					if (value === null) continue;
					ctx.fillStyle = viridis(value);
					ctx.fillRect(xPixel, yPixel, scale, scale);
					continue;
				}
				const left = xPixel;
				const right = xPixel + Math.floor(scale / 2);
				const top = yPixel;
				const bottom = yPixel + Math.floor(scale / 2);
				const edge = scale / 2;
				ctx.fillStyle = 'hsl(0,0%,30%)';
				// Top left
				ctx.fillRect(left, top, edge, edge);
				// Bottom Right
				ctx.fillRect(right, bottom, edge, edge);

				ctx.fillStyle = 'hsl(0,0%,50%)';
				// Top Right
				ctx.fillRect(right, top, edge, edge);
				// Bottom Left
				ctx.fillRect(left, bottom, edge, edge);
			}
		}
	});
};

const updateContext = (): boolean => {
	const c = canvas.getContext('2d');
	if (!c) return false;
	ctx = c;
	return true;
};

const getMaybeSerialized = (v: object | string): object => {
	if (typeof v === 'string') return JSON.parse(v);
	return v;
};

const fetchData = async () => {
	const mcdocData = await fetch('https://raw.githubusercontent.com/SpyglassMC/vanilla-mcdoc');
};

const main = (e: MessageEvent) => {
	const message = parse(DeepslateRenderWorkerMessageSchema, e.data);
	switch (message.kind) {
		case 'init': {
			canvas = message.canvas;
			updateContext();
			break;
		}
		case 'injest::noise': {
			deepslate.WorldgenRegistries.NOISE.register(
				new deepslate.Identifier(message.ref.namespace, message.ref.name),
				deepslate.NoiseParameters.fromJson(getMaybeSerialized(message.value))
			);
			break;
		}
		case 'update::preview': {
			memo = new Map();
			const { type } = message;
			if (type in previews) {
				updateFn = previews[type as keyof typeof previews];
				value = getMaybeSerialized(message.value);
			}
			break;
		}
		case 'update::canvas_dimensions': {
			canvas.height = message.y;
			canvas.width = message.x;
			updateContext();
			break;
		}
		case 'update::view': {
			scale = message.scale;
			origin = message.origin;
			minY = message.minY;
			worldHeight = message.worldHeight;

			break;
		}
		case 'request::value_at_point': {
			pointValFn
				? self.postMessage({
						kind: 'response::value_at_point',
						point: message.point,
						value: getVal(message.point) ?? null,
						label: pointValLabel
					})
				: null;
			return;
		}

		case 'update::marker_pos': {
			markerPosition = message.pos;
			break;
		}
	}

	if (ctx) {
		reset(); // Ensure we end up with a steady random structure unless explicitly reset
		updateFn?.(value);

		if (markerPosition) {
			requestAnimationFrame(() => {
				if (!markerPosition) return;
				ctx.fillStyle = 'rgb(255,0,0)';
				const pos = coordinateToPixel(
					markerPosition,
					origin,
					{ w: canvas.width, h: canvas.height },
					scale
				);
				ctx.fillRect(pos.x, pos.y, scale, scale);
			});
		}
	}
};

self.addEventListener('message', main);

const previews = {
	Noise: (value: object) => {
		const normalNoise = new deepslate.NormalNoise(random, value as any);

		pointValFn = ({ x, y }) => {
			const res = normalNoise.sample(x, y, 0);
			return res;
		};
		pointValLabel = 'Value';
		drawAtCoords();
	},
	DensityFunction: (value: object) => {
		let fn = deepslate.DensityFunction.fromJson(value);
		if (fn instanceof deepslate.DensityFunction.Noise) {
			const noise = new deepslate.NormalNoise(random, fn.noiseData.value());
			fn = new deepslate.DensityFunction.Noise(fn.xzScale, fn.yScale, fn.noiseData, noise);
		}
		pointValFn = ({ x, y }) => {
			const res = fn.compute(deepslate.DensityFunction.context(x, y, 0));
			return res;
		};
		pointValLabel = 'Density';
		drawAtCoords(true);
	}
};
