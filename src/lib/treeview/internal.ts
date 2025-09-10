import { getContext, setContext } from 'svelte';

const TreeViewLevelCtxKey = Symbol('TreeViewLevel');

type TreeViewLevelCtx = { path: string[]; level: number };
export const treeViewLevel = (name?: string, root?: string[]): TreeViewLevelCtx => {
	const prev = getContext<TreeViewLevelCtx>(TreeViewLevelCtxKey);
	const nextPath = [];
	if (prev) nextPath.push(...prev.path);
	if (root) nextPath.push(...root);
	if (name) nextPath.push(name);
	if (root) console.log(nextPath)
	const next = {
		path: nextPath,
		level: (prev?.level ?? 0) + 1
	};
	setContext<TreeViewLevelCtx>(TreeViewLevelCtxKey, next);
	return next;
};
