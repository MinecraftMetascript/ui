import type { Attachment } from 'svelte/attachments';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { json } from '@codemirror/lang-json';

export const preview: (content: string) => Attachment = (content: string) => {
	const view = new EditorView({
		doc: content,
		extensions: [
			basicSetup,
			EditorState.readOnly.of(true),
			EditorView.editable.of(false),
			EditorView.contentAttributes.of({ tabindex: '0' }),

			json()
		]
	});
	$effect(() => {
		view.dispatch({
			changes: [
				{
					from: 0,
					to: view.state.doc.length,
					insert: content
				}
			]
		});
	});
	return (node) => {
		node.appendChild(view.dom);
		return () => view.dom.remove();
	};
};
