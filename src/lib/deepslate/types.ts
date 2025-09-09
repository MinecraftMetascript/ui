export type ValueLookupFn = (pos: {
	x: number;
	y: number;
}) => { label: string; value: string } | null;
