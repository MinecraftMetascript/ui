import { getContext, setContext } from 'svelte';

const TreeViewLevelCtxKey = Symbol('TreeViewLevel');

export const treeViewLevel = (): number => {
	const initial = getContext<number>(TreeViewLevelCtxKey) ?? 0;
	setContext<number>(TreeViewLevelCtxKey, initial + 1);
	return initial;
};
