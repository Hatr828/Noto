<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { Extension } from "@codemirror/state";
  import { initializeEditor, type EditorModuleOptions } from "./EditorMd";
  import "./EditorMd.css"

  /**
   * Additional CodeMirror extensions
   */
  export let extensions: Extension[] = [];
  /**
   * Auto-save interval in seconds (0 to disable)
   */
  export let saveInterval: number = 0;
  /**
   * Absolute filesystem path for Tauri commands
   */
  export let filePath: string;

  let container: HTMLDivElement;
  let editorModule: ReturnType<typeof initializeEditor>;

  onMount(() => {
    const opts: EditorModuleOptions = { extensions, saveInterval, filePath };
    editorModule = initializeEditor(container, opts);
  });

  onDestroy(() => {
    editorModule.destroy();
  });

  // React to filePath change
  $: if (editorModule) {
    editorModule.reload();
  }

  /**
   * Expose API to get text
   */
  export function getText(): string {
    return editorModule.getText();
  }
</script>

<div bind:this={container} class="editor-container"></div>
