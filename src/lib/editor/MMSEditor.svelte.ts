import { getContext, setContext } from 'svelte';
import { MMSProject } from '../MMSProject.svelte';

export type PreviewSelection = {
	path: string[];
	source: 'symbol' | 'file';
};

const GetSymbolPreviewContent = ({ project, selectedPreview }: MMSEditor) => {
	if (!selectedPreview) return null;
	const [ns, name] = selectedPreview.path[0]?.split(":") ?? []
	const symbol = project.symbols?.[ns]?.[name];
	if (!symbol) {
		return null;
	}
	return JSON.stringify(symbol.value, null, 2) ?? null;
};

class MMSEditor {
	readonly project: MMSProject;

	private _selectedPreview: PreviewSelection | null = $state(
		(() => {
			if (typeof window !== 'undefined') {
				const data = localStorage.getItem('MMS:SelectedPreview');
				if (data) {
					return JSON.parse(data);
				}
			}
			return null;
		})()
	);
	get selectedPreview() {
		return this._selectedPreview;
	}
	set selectedPreview(value: PreviewSelection | null) {
		if (typeof window !== 'undefined') {
			localStorage.setItem('MMS:SelectedPreview', JSON.stringify(value));
		}
		this._selectedPreview = value;
	}

	get previewSymbol() {
		if (this.selectedPreview?.source !== 'symbol') return null;
		const [sNs, sName] = this.selectedPreview.path[0]?.split(":") ?? []
		const ns = this.project.symbols?.[sNs];
		const val = ns?.[sName];
		if (!val) return null;
		return val;
	}

	get previewContent() {
		if (!this.selectedPreview) return null;
		if (this.selectedPreview.source === 'symbol') return GetSymbolPreviewContent(this);
		const target = this.project.getFile(this.selectedPreview.path.slice(1));
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
