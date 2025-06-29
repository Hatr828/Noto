<script lang="ts">
  import { showModal } from "$lib/Modals/Modal_Info/Modal_Info";
  import "./FileExplorer.css";
  import { VirtualList } from "svelte-virtuallists";
  import {
    FileNodeType,
    type FileNode,
    getFileNodeAsString,
    flatten,
  } from "$lib/FileNodes_types";
  import { onMount } from "svelte";
  import {
    toggleFolder,
    collapseAllFolders,
    createAndAddNode,
  } from "./FileExplorer";
  import { treeData } from "$stores/tree";
  import { get } from "svelte/store";

  $: flatNodes = flatten($treeData);

  let selectedNode: FileNode | null = null;

  async function handleToggle(node: FileNode) {
    if (node.type === "folder") {
      await toggleFolder(node);

      if (node.expanded === false) {
        selectedNode = null;
      } else {
        selectedNode = node;
      }
    }
  }

  function handleAdd(type: FileNodeType, name: string) {
    createAndAddNode(selectedNode, type, name);
  }

  function handleCollapseAll() {
    collapseAllFolders();
  }

  //Context menu
  let contextMenuVisible: boolean = false;
  let contextMenuX: number = 0;
  let contextMenuY: number = 0;
  let contextNode: FileNode | null = null;

  function handleContextMenu(event: MouseEvent, node: FileNode) {
    event.preventDefault();
    event.stopPropagation();
    contextMenuX = event.clientX;
    contextMenuY = event.clientY;
    contextNode = node;
    contextMenuVisible = true;
  }

  function handleEdit(node: FileNode) {
    console.log("Edit node:", node);
  }

  function hideContextMenu() {
    contextMenuVisible = false;
  }

  onMount(() => {
    window.addEventListener("scroll", hideContextMenu);
    window.addEventListener("resize", hideContextMenu);
    return () => {
      window.removeEventListener("scroll", hideContextMenu);
      window.removeEventListener("resize", hideContextMenu);
    };
  });

  //

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
    <button
      on:click={() => handleAdd(FileNodeType.Folder, "New Folder")}
      class="icon-btn"
    >
      <span class="material-icons-outlined">create_new_folder</span>
    </button>
    <button
      on:click={() => handleAdd(FileNodeType.Md, "New File")}
      class="icon-btn"
    >
      <span class="material-icons-outlined">note_add</span>
    </button>
    <button on:click={handleCollapseAll} class="icon-btn" title="Collapse all">
      <span class="material-icons-outlined">unfold_less</span>
    </button>
  </div>

  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="tree"
    on:click={() => {
      hideContextMenu();
      selectedNode = null;
    }}
  >
    <VirtualList
      items={flatNodes}
      style="height:100%; width:100%"
      class="tree-scroll"
    >
      {#snippet vl_slot({ item })}
        <div
          class="node"
          style="padding-left: {item.depth * 16}px"
          on:click|stopPropagation={() => handleToggle(item.node)}
        >
          {#if item.node.type === "folder"}
            <span
              on:contextmenu|stopPropagation={(e: MouseEvent) =>
                handleContextMenu(e, item.node)}
              class="material-icons-outlined icon"
              style="cursor: default;"
            >
              {item.node.expanded ? "expand_more" : "chevron_right"}
            </span>
          {:else}
            <span class="icon"></span>
          {/if}

          <span
            class="title"
            on:contextmenu|stopPropagation={(e: MouseEvent) =>
              handleContextMenu(e, item.node)}
            style="cursor: default; user-select: none;"
            title="right click - menu"
          >
            {item.node.name}
          </span>
        </div>
      {/snippet}
    </VirtualList>
  </div>
</div>

<div bind:this={resizer} class="resizer" on:pointerdown={onPointerDown}></div>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore element_invalid_self_closing_tag -->
{#if contextMenuVisible}
  <div
    class="menu-overlay"
    on:click={hideContextMenu}
    on:contextmenu={hideContextMenu}
  />

  <div
    class="context-menu"
    style="top: {contextMenuY}px; left: {contextMenuX}px;"
    on:click|stopPropagation
  >
    <div
      class="context-item"
      on:click={() => {
        if (contextNode) {
          const argsArray = getFileNodeAsString(contextNode);
          showModal("FileNode", argsArray);
        }
        hideContextMenu();
      }}
    >
      Info
    </div>
    <div
      class="context-item"
      on:click={() => {
        if (contextNode) {
          handleEdit(contextNode);
        }
        hideContextMenu();
      }}
    >
      Edit
    </div>
  </div>
{/if}
