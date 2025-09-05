import { getContext, setContext } from 'svelte';
import { MMSProject } from '../MMSProject.svelte';

export type PreviewSelection = {
	path: string[];
	source: 'symbol' | 'file';
};

const GetSymbolPreviewContent = ({ project, selectedPreview }: MMSEditor) => {
	if (!selectedPreview) return null;
	const symbol = project.symbols?.[selectedPreview.path[0]];
	if (!symbol) {
		return null;
	}

	const sourceFile = project.source[symbol.contentLocation.Filename] ?? '';
	return (
		JSON.stringify(
			{
				compiled: symbol.value,
				source: sourceFile.substring(
					symbol.contentLocation.StartIdx,
					symbol.contentLocation.StopIdx + 1
				)
			},
			null,
			2
		) ?? null
	);
};

class MMSEditor {
	readonly project: MMSProject;

	selectedPreview: PreviewSelection | null = $state(null);

	get previewSymbol() {
		if (this.selectedPreview?.source !== 'symbol') return null;
		const symbol = this.project.symbols?.[this.selectedPreview.path[0]];
		if (!symbol) return null;
		return symbol;
	}

	get previewContent() {
		if (!this.selectedPreview) return null;
		if (this.selectedPreview.source === 'symbol') return GetSymbolPreviewContent(this);
		const target = this.project.getFile(this.selectedPreview.path);
		if (!target || target.isDir) return null; // not a valid FILE
		return target.content;
	}

	constructor() {
		this.project = new MMSProject();
	}

	async init() {
		return this.project.init();
	}
}

const EditorContextKey = Symbol('EditorContext');
export const createEditorContext = () => {
	const editor = new MMSEditor();
	setContext(EditorContextKey, editor);
	return editor;
};
export const useEditorContext = () => {
	const editor = getContext<MMSEditor | undefined>(EditorContextKey);
	if (!editor) throw new Error('Editor context not available!');
	return editor;
};

export const editor = new MMSEditor();
