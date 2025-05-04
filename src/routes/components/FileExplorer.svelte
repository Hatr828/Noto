<script lang="ts">
    import { invoke } from '@tauri-apps/api/core';
    import { treeStore, currentContent } from '../lib/stores';

    let explorerEl: HTMLDivElement;
    let resizer: HTMLDivElement;
  
    async function openNode(path: string) {
      const content: string = await invoke('open_note', { path });
      currentContent.set(content);
    }
  
    async function addFolder() {
    }
    async function addFile() {
    }
  
    let startX: number, startWidth: number, dragging = false;
    function onPointerDown(e: PointerEvent) {
      dragging = true;
      startX = e.clientX;
      startWidth = explorerEl.getBoundingClientRect().width;
      resizer.setPointerCapture(e.pointerId);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    }
    function onPointerMove(e: PointerEvent) {
      if (!dragging) return;
      const dx = e.clientX - startX;
      explorerEl.style.width = `${startWidth + dx}px`;
    }
    function onPointerUp(e: PointerEvent) {
      dragging = false;
      resizer.releasePointerCapture(e.pointerId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    }
  </script>
  
  <div class="file-explorer" bind:this={explorerEl}>
    <div class="toolbar">
      <button on:click={addFolder} class="icon-btn">
        <span class="material-icons-outlined">create_new_folder</span>
      </button>
      <button on:click={addFile} class="icon-btn">
        <span class="material-icons">note_add</span>
      </button>
    </div>
    <ul class="tree">
      {#each $treeStore as node (node.nodePath)}
        <li class="node" on:click={() => openNode(node.nodePath)}>
          <span class="material-symbols-outlined">
            {node.hasChildren ? 'folder' : 'description'}
          </span>
          <span class="title">{node.title}</span>
        </li>
      {/each}
    </ul>
  </div>
  
  <!-- разделитель для ресайза -->
  <div
    bind:this={resizer}
    class="resizer"
    on:pointerdown={onPointerDown}
    data-tooltip="Перетащите, чтобы изменить ширину"
  />
  
  <style>
    .file-explorer {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 300px;              /* начальная ширина проводника */
      min-width: 100px;
      max-width: 100%;
      height: 100%;
      background: var(--color-explorer-bg);
      border-right: 1px solid var(--color-resizer);
      overflow: hidden;
    }
  
    .toolbar {
      display: flex;
      gap: var(--spacing-sm);
      padding: var(--spacing-xs) var(--spacing-sm);
      background: var(--color-sidebar-bg);
      border-bottom: 1px solid var(--color-resizer);
    }
    .icon-btn {
      background: none;
      border: none;
      padding: var(--spacing-xs);
      cursor: pointer;
      border-radius: 4px;
      transition: background 0.2s;
    }
    .icon-btn:hover {
      background: var(--color-hover);
    }
    .icon-btn .material-symbols-outlined {
      font-size: 24px;
      color: var(--color-text);
    }
  
    .tree {
      list-style: none;
      margin: 0;
      padding: 0;
      overflow-y: auto;          /* скролл при длинном списке */
      flex: 1;
    }
    .node {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-sm);
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .node:hover {
      background: var(--color-hover);
    }
    .node .material-symbols-outlined {
      font-size: 20px;
      color: var(--color-text);
    }
    .node .title {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  
    .resizer {
      width: 6px;
      cursor: col-resize;
      flex-shrink: 0;
      position: relative;
    }
    .resizer::before {
      content: '';
      position: absolute;
      top: 0; bottom: 0;
      left: 2px; width: 2px;
      background: var(--color-resizer);
    }
  </style>