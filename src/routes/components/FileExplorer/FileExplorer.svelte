<script lang="ts">
  import "./FileExplorer.css";
  import { VirtualList } from "svelte-virtuallists";
  import type { FileNode } from "$lib/types";
    import {
    flatten,
    toggleFolder,
    createTreeNode,
    addNodeAt as addTreeNode,
    collapseAllFolders as collapseTree
  } from './FileExplorer';
  import { tree } from '$stores/tree'

  $: flatNodes = flatten($tree);

  let selectedNode: FileNode | null = null;

 async function handleToggle(node: FileNode) {
  await toggleFolder(node);

  if (node.type === 'folder') {
    selectedNode = node;
  }
}

  function handleAdd(newNode: FileNode) {
   // tree = addTreeNode(tree, selectedNode?.id ?? null, newNode);
  }

  function handleCollapseAll() {
   // tree = collapseTree(tree);
  }

 
  // Resaizer
  let explorerEl: HTMLDivElement;
  let resizer: HTMLDivElement;
  let startX: number;
  let startWidth: number;
  let dragging = false;
  function onPointerDown(e: PointerEvent) {
    dragging = true;
    startX = e.clientX;
    startWidth = explorerEl.getBoundingClientRect().width;
    resizer.setPointerCapture(e.pointerId);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  }
  function onPointerMove(e: PointerEvent) {
    if (!dragging) return;
    explorerEl.style.width = `${startWidth + e.clientX - startX}px`;
  }
  function onPointerUp(e: PointerEvent) {
    dragging = false;
    resizer.releasePointerCapture(e.pointerId);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  }
  //
</script>

<div class="file-explorer" bind:this={explorerEl}>
  <div class="toolbar">
      <button on:click={() => handleAdd(createTreeNode('folder', selectedNode?.path ?? "null"))} class="icon-btn">
        <span class="material-icons-outlined">create_new_folder</span>
      </button>
      <button on:click={() => handleAdd(createTreeNode('file', selectedNode?.path ?? "null"))} class="icon-btn">
        <span class="material-icons-outlined">note_add</span>
      </button>
      <button on:click={handleCollapseAll} class="icon-btn" title="Collapse all">
        <span class="material-icons-outlined">unfold_less</span>
      </button>
    </div>

  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="tree" on:click={() => (selectedNode = null)}>
    <VirtualList items={flatNodes} style="height:100%; width:100%">
      {#snippet vl_slot({ item })}
        <div
          class="node"
          style="padding-left: {item.depth * 16}px"
          on:click|stopPropagation={() => handleToggle(item.node)}
        >
          {#if item.node.type === 'folder'}
            <span class="material-icons-outlined icon">
              {item.node.expanded ? 'expand_more' : 'chevron_right'}
            </span>
          {:else}
            <span class="icon"></span>
          {/if}
          <span class="title">{item.node.name}</span>
        </div>
      {/snippet}
    </VirtualList>
  </div>
</div>
<div bind:this={resizer} class="resizer" on:pointerdown={onPointerDown}></div>