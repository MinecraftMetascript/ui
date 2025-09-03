
import * as view from '@codemirror/view';
import * as commands from '@codemirror/commands';
import * as _state from '@codemirror/state';
import * as language from '@codemirror/language';
import * as autocomplete from '@codemirror/autocomplete';
import * as search from '@codemirror/search';
import * as lint from '@codemirror/lint';

export const CoreExtensions = [
    // view.ViewPlugin.fromClass(
    //     class {
    //         update(update: view.ViewUpdate) {
    //             if (update.docChanged) value = update.state.doc.toString();
    //         }
    //     }
    // ),
    view.lineNumbers(),
    view.highlightActiveLineGutter(),
    view.highlightSpecialChars(),
    commands.history(),
    language.foldGutter(),
    view.drawSelection(),
    view.dropCursor(),
    _state.EditorState.allowMultipleSelections.of(true),
    language.indentOnInput(),
    language.syntaxHighlighting(language.defaultHighlightStyle, { fallback: true }),
    language.bracketMatching(),
    autocomplete.closeBrackets(),
    autocomplete.autocompletion(),
    view.rectangularSelection(),
    view.crosshairCursor(),
    view.highlightActiveLine(),
    search.highlightSelectionMatches(),
    view.keymap.of([
        ...autocomplete.closeBracketsKeymap,
        ...commands.defaultKeymap,
        ...search.searchKeymap,
        ...commands.historyKeymap,
        ...language.foldKeymap,
        ...autocomplete.completionKeymap,
        ...lint.lintKeymap,
        commands.indentWithTab
    ])
]