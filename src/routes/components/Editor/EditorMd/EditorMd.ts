import { EditorState, type Extension, RangeSetBuilder } from "@codemirror/state";
import {
    EditorView,
    ViewUpdate,
    keymap,
    highlightSpecialChars,
    drawSelection,
    Decoration,
    type DecorationSet,
    WidgetType,
    ViewPlugin
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { indentOnInput, bracketMatching, foldGutter, foldKeymap } from "@codemirror/language";
import { markdown, markdownKeymap, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { highlightSelectionMatches } from "@codemirror/search";
import { oneDark } from "@codemirror/theme-one-dark";
import { invoke } from "@tauri-apps/api/core";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { headingRules } from "$lib/Editor/MdRules"

const headingHighlight = HighlightStyle.define(headingRules);

// A widget that renders nothing, used to hide text
class EmptyWidget extends WidgetType {
    toDOM() {
        const span = document.createElement("span");
        span.style.display = "none";
        return span;
    }
}

/**
 * Build a plugin that hides ATX heading markers (# )
 * and applies a CSS class to the heading text.
 */
function createHeadingPlugin(): Extension {
    return ViewPlugin.fromClass(
        class {
            decorations: DecorationSet;
            constructor(view: EditorView) {
                this.decorations = buildHeadingDecorations(view);
            }
            update(update: any) {
                if (update.docChanged || update.viewportChanged) {
                    this.decorations = buildHeadingDecorations(update.view);
                }
            }
        },
        { decorations: v => v.decorations }
    );
}

/**
 * Scan visible ranges and return a DecorationSet for headings.
 */
function buildHeadingDecorations(view: EditorView): DecorationSet {
    const decos: { from: number; to: number; deco: Decoration }[] = [];
    for (const { from, to } of view.visibleRanges) {
        let pos = from;
        while (pos <= to) {
            const line = view.state.doc.lineAt(pos);
            const match = line.text.match(/^(#+)\s+/);
            if (match) {
                const prefixLen = match[0].length;
                decos.push({
                    from: line.from,
                    to: line.from + prefixLen,
                    deco: Decoration.replace({ widget: new EmptyWidget() })
                });
                decos.push({
                    from: line.from,
                    to: line.from,
                    deco: Decoration.line({ attributes: { class: 'cm-header1' } })
                });
            }
            pos = line.to + 1;
        }
    }
    decos.sort((a, b) => a.from - b.from || a.to - b.to);
    const builder = new RangeSetBuilder<Decoration>();
    for (const { from, to, deco } of decos) {
        builder.add(from, to, deco);
    }
    return builder.finish();
}

/**
 * Generate base extensions for the editor.
 */
function createBaseExtensions(additional: Extension[]): Extension[] {
    return [
        EditorView.lineWrapping,
        highlightSpecialChars(),
        drawSelection(),
        history(),
        indentOnInput(),
        bracketMatching(),
        highlightSelectionMatches(),

        oneDark,

        syntaxHighlighting(headingHighlight),
        markdown({
            base: markdownLanguage,
            codeLanguages: languages,
            addKeymap: true
        }),

        createHeadingPlugin(),

        keymap.of([
            ...defaultKeymap,
            ...historyKeymap,
            ...foldKeymap
        ]),
        ...additional
    ];
}

/**
 * Load file content via Tauri and insert into the editor.
 */
async function loadFile(view: EditorView, path: string) {
    try {
        const text = await invoke('read_markdown', { path });
        view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text as string } });
    } catch (e) {
        console.error('Failed to load file:', e);
    }
}

/**
 * Setup auto-save: periodically write content back to file when dirty.
 */
function setupAutoSave(view: EditorView, path: string, interval: number) {
    let dirty = false;
    const origDispatch = view.dispatch;
    view.dispatch = (tr) => {
        origDispatch.call(view, tr);
        if (tr.docChanged) dirty = true;
    };
    if (interval > 0) {
        const id = window.setInterval(async () => {
            if (dirty) {
                try {
                    await invoke('save_markdown', { path, contents: view.state.doc.toString() });
                    dirty = false;
                } catch (e) {
                    console.error('Auto-save failed:', e);
                }
            }
        }, interval * 1000);
        return () => clearInterval(id);
    }
    return () => { };
}

export interface EditorModuleOptions {
    extensions?: Extension[];
    saveInterval?: number;
    filePath: string;
}

/**
 * Initialize a CodeMirror editor with file loading and auto-save.
 */
export function initializeEditor(
    container: HTMLDivElement,
    options: EditorModuleOptions
) {
    const { extensions = [], saveInterval = 0, filePath } = options;
    const baseExts = createBaseExtensions(extensions);
    const view = new EditorView({
        parent: container,
        state: EditorState.create({ doc: '', extensions: baseExts })
    });
    // Load initial content
    loadFile(view, filePath);
    // Setup auto-save and get cleanup function
    const cleanupAuto = setupAutoSave(view, filePath, saveInterval);

    return {
        reload: (async () => loadFile(view, filePath)),
        getText: () => view.state.doc.toString(),
        destroy: () => {
            view.destroy();
            cleanupAuto();
        }
    };
}