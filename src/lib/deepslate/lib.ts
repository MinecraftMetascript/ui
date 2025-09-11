import type { Point } from './proto';

export const pixelToCoordinate = (
	pixel: Point,
	offset: Point,
	canvasSize: { w: number; h: number },
	scale: number
): Point => {
	const out = { ...pixel };
	// Translate to coordinate grid from pixel grid
	const pX = Math.floor(out.x / scale);
	const pY = Math.floor(out.y / scale);
	const cWidth = Math.floor(canvasSize.w / scale);
	const cHeight = Math.floor(canvasSize.h / scale);

	out.x = pX;
	out.y = cHeight - pY; // reverse

	// Apply offset
	out.x += offset.x;
	out.y += offset.y;

	out.x -= Math.floor(cWidth / 2);
	out.y -= Math.floor(cHeight / 2);

	// Account for centering ?

	return out;
};

export const coordinateToPixel = (
	coord: Point,
	offset: Point,
	canvasSize: { w: number; h: number },
	scale: number
): Point => {
	const out = { ...coord };
	// Apply offset
	out.x -= offset.x;
	out.y -= offset.y;


	// Translate to pixel grid from coordinate grid
	out.x = out.x * scale;
	out.y = canvasSize.h - out.y * scale;

	out.x += Math.floor(canvasSize.w / 2);
	out.y -= Math.floor(canvasSize.h / 2);

	out.x -= out.x % scale;
	out.y -= out.y % scale;

	return out;
};
