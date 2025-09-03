export type LeafNode = {
	name: string;
	content: string;
	data: { kind: string; value: any } | null;
};
export type GroupNode = { name: string; children: Record<string, TreeNode>; collapsed?: boolean };
export type TreeNode = LeafNode | GroupNode;
