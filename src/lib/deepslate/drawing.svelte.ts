export const drawValues = (
	fn: (x: number, y: number) => number,
	canvas: HTMLCanvasElement,
	{
		width,
		height,
		scale,
		dpr,
		origin
	}: { width: number; height: number; scale: number; dpr: number; origin: { x: number; y: number } }
) => {
	const vals: Record<number, Record<number, number>> = {};

	for (let pixelX = 0; pixelX < width; pixelX += 1) {
		vals[pixelX] = {};
		for (let pixelY = 0; pixelY < height; pixelY += 1) {
			const coordX = pixelX + origin.x;
			const coordY = pixelY + origin.y;
			vals[pixelX][pixelY] = fn(coordX, Math.floor(height - coordY));
		}
	}

	requestAnimationFrame(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.scale(scale, scale);

		// ctx.fillText('.', 0, i, scale);
		// for (let i = 0; i < 10; i++) {
		// 	ctx.fillStyle = 'black';

		// 	console.log(i);
		// }

		for (let pixelX = 0; pixelX < width; pixelX += 1) {
			for (let pixelY = 0; pixelY < height; pixelY += 1) {
				writeColor(vals[pixelX][pixelY], ctx, pixelX, Math.floor(height - pixelY), scale * 2);
			}
		}
	});
};
export const writeColor = (
	val: number,
	ctx: CanvasRenderingContext2D,
	pixelX: number,
	pixelY: number,
	scale: number
) => {
	const color = `hsl(0, ${(val + 1) * 50}%, 50%)`;
	ctx.fillStyle = color;
	ctx.fillRect(pixelX * scale, pixelY * scale, scale, scale);
};
