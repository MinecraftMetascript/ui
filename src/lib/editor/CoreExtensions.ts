import {
	lineNumbers,
	highlightActiveLineGutter,
	highlightSpecialChars,
	drawSelection,
	dropCursor,
	rectangularSelection,
	crosshairCursor,
	highlightActiveLine,
	keymap
} from '@codemirror/view';
import { history, defaultKeymap, historyKeymap, indentWithTab } from '@codemirror/commands';
import {
	foldGutter,
	indentOnInput,
	syntaxHighlighting,
	defaultHighlightStyle,
	bracketMatching,
	foldKeymap
} from '@codemirror/language';
import {
	closeBrackets,
	autocompletion,
	closeBracketsKeymap,
	completionKeymap
} from '@codemirror/autocomplete';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { EditorState } from '@codemirror/state';
import { lintKeymap } from '@codemirror/lint';

export const CoreExtensions = [
	lineNumbers(),
	highlightActiveLineGutter(),
	highlightSpecialChars(),
	history(),
	foldGutter(),
	drawSelection(),
	dropCursor(),
	EditorState.allowMultipleSelections.of(true),
	indentOnInput(),
	syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
	bracketMatching(),
	closeBrackets(),
	autocompletion(),
	rectangularSelection(),
	crosshairCursor(),
	highlightActiveLine(),
	highlightSelectionMatches(),
	keymap.of([
		...closeBracketsKeymap,
		...defaultKeymap,
		...searchKeymap,
		...historyKeymap,
		...foldKeymap,
		...completionKeymap,
		...lintKeymap,
		indentWithTab
	])
];
