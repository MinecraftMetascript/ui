const viridisStops = [
	'#440154',
	'#482475',
	'#414487',
	'#355f8d',
	'#2a788e',
	'#22a884',
	'#7ad151',
	'#fde725'
];

const hex2rgb = (h: string) => {
	const n = h.startsWith('#') ? h.slice(1) : h;
	const i =
		n.length === 3
			? n
					.split('')
					.map((c) => c + c)
					.join('')
			: n;
	return {
		r: parseInt(i.slice(0, 2), 16),
		g: parseInt(i.slice(2, 4), 16),
		b: parseInt(i.slice(4, 6), 16)
	};
};

const viridisRGB = viridisStops.map(hex2rgb);

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

export const viridis = (t: number) => {
	t = clamp01(t);
	const n = viridisRGB.length - 1;
	const i = Math.min(Math.floor(t * n), n - 1);
	const f = t * n - i;
	const c0 = viridisRGB[i],
		c1 = viridisRGB[i + 1];
	const r = Math.round(c0.r + (c1.r - c0.r) * f);
	const g = Math.round(c0.g + (c1.g - c0.g) * f);
	const b = Math.round(c0.b + (c1.b - c0.b) * f);
	return `rgb(${r},${g},${b})`;
};
