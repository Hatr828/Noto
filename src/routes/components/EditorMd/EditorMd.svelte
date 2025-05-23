<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { EditorState } from '@codemirror/state';
  import type { Extension } from '@codemirror/state';
  import {
    EditorView,
    keymap
  } from '@codemirror/view';
  import {
    defaultKeymap,
    history,
    historyKeymap
  } from '@codemirror/commands';
  import { markdown } from '@codemirror/lang-markdown';
  import {
    searchKeymap,
    highlightSelectionMatches
  } from '@codemirror/search';
  import { oneDark } from '@codemirror/theme-one-dark';

  import './EditorMd.css';

  export let content: string = '';
  export let extensions: Extension[] = [];

  const baseExtensions: Extension[] = [
    EditorView.lineWrapping,
    history(),
    highlightSelectionMatches(),
    keymap.of([
      ...defaultKeymap,
      ...historyKeymap,
      ...searchKeymap,
    ]),
    oneDark,
    markdown(),
  ];

  let view: EditorView;
  let container: HTMLDivElement;
  const dispatch = createEventDispatcher();

  onMount(() => {
    view = new EditorView({
      parent: container,
      state: EditorState.create({
        doc: content,
        extensions: [...baseExtensions, ...extensions],
      }),
    });

    const oldDispatch = view.dispatch;
    view.dispatch = (tr) => {
      oldDispatch.call(view, tr);
      if (tr.docChanged) {
        dispatch('update', { text: view.state.doc.toString() });
      }
    };
  });

  onDestroy(() => view.destroy());

  /** Доступ к текущему тексту извне */
  export function getText(): string {
    return view.state.doc.toString();
  }
</script>

<div bind:this={container} class="editor-container"></div>
