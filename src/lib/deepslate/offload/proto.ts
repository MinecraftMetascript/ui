import * as v from 'valibot';

export const PointSchema = v.object({ x: v.number(), y: v.number() });
export type Point = v.InferOutput<typeof PointSchema>;

const Integer = v.pipe(v.number(), v.integer());

export const CanvasInitMessageSchema = v.object({
	kind: v.literal('init'),
	canvas: v.custom<OffscreenCanvas>((i) => {
		if (i instanceof OffscreenCanvas) return true;
		return false;
	})
});

export const UpdatePreviewMessageSchema = v.object({
	kind: v.literal('update::preview'),
	type: v.string(),
	value: v.union([v.looseObject({}), v.string()])
});

export const UpdateCanvasDimensionsMessageSchema = v.object({
	kind: v.literal('update::canvas_dimensions'),
	x: Integer,
	y: Integer
});

export const UpdateViewMessageSchema = v.object({
	kind: v.literal('update::view'),
	scale: Integer,
	origin: PointSchema,
	minY: Integer,
	worldHeight: v.pipe(Integer, v.minValue(1))
});

export const RequestValueAtPoint = v.object({
	kind: v.literal('request::value_at_point'),
	point: PointSchema
});
export const ResponseValueAtPoint = v.object({
	kind: v.literal('response::value_at_point'),
	point: PointSchema,
	value: v.number(),
	label: v.string()
});

export const UpdateMarkerPosSchema = v.object({
	kind: v.literal('update::marker_pos'),
	pos: v.nullable(PointSchema)
});

export const InjestNoiseMessageSchema = v.object({
	kind: v.literal('injest::noise'),
	ref: v.object({ namespace: v.string(), name: v.string() }),
	value: v.union([v.looseObject({}), v.string()])
});

export const DeepslateRenderWorkerMessageSchema = v.union([
	CanvasInitMessageSchema,
	UpdatePreviewMessageSchema,
	UpdateCanvasDimensionsMessageSchema,
	UpdateViewMessageSchema,
	InjestNoiseMessageSchema,
	RequestValueAtPoint,
	ResponseValueAtPoint,
	UpdateMarkerPosSchema
]);
export type DeepslateRenderWorkerMessage = v.InferOutput<typeof DeepslateRenderWorkerMessageSchema>;
