<script lang="ts">
  import './FileExplorer.css';
  import { VirtualList } from 'svelte-virtuallists';
  import type { FileNode } from '$lib/types';

  let tree: FileNode[] = [
  {
      id: '1',
      name: 'Папка 1',
      type: 'folder',
      expanded: false,
      children: [
        { id: '1.1', name: 'Подпапка 1.1', type: 'folder', expanded: false },
        { id: '1.2', name: 'Файл1.2.txt', type: 'file', expanded: false }
      ]
  },
    { id: '2', name: 'Папка 2', type: 'folder', expanded: false, children: [] },
    { id: '3', name: 'Файл.txt', type: 'file', expanded: false }
  ];

  function flatten(nodes: FileNode[], depth = 0): { node: FileNode; depth: number }[] {
    return nodes.flatMap(node => {
        const entry = { node, depth };
        if (node.type === 'folder' && node.expanded && node.children) {
        return [entry, ...flatten(node.children, depth + 1)];
        }
        return [entry];
    });
  }

  $: flatNodes = flatten(tree);

  async function toggle(node: FileNode) {
    if (node.type !== 'folder') return;
    node.expanded = !node.expanded;
    tree = [...tree];
  }

  let selectedId: string | null = null;

  function addNode(parentId: string | null, isFolder: boolean) {
    const newNode: FileNode = {
        id: Date.now().toString(),
        name: isFolder ? 'Новая папка' : 'Новый файл.txt',
        type: isFolder ? 'folder' : 'file',
        children: isFolder ? [] : undefined
    };
    if (!parentId) {
        tree = [...tree, newNode];
    } else {
        function recurse(nodes: FileNode[]): FileNode[] {
        return nodes.map(n => {
            if (n.id === parentId && n.type === 'folder') {
            return { ...n, children: [...(n.children ?? []), newNode], expanded: true };
            }
            return n.children ? { ...n, children: recurse(n.children) } : n;
        });
        }
        tree = recurse(tree);
    }
  }

  function expandAll() {
  function recurse(nodes: FileNode[]): FileNode[] {
    return nodes.map(n => ({
      ...n,
      expanded: n.type === 'folder',
      children: n.children ? recurse(n.children) : n.children
    }));
  }
  tree = recurse(tree);
}

function collapseAll() {
  function recurse(nodes: FileNode[]): FileNode[] {
    return nodes.map(n => ({
      ...n,
      expanded: false,
      children: n.children ? recurse(n.children) : n.children
    }));
  }
  tree = recurse(tree);
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
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }
  function onPointerMove(e: PointerEvent) {
    if (!dragging) return;
    explorerEl.style.width = `${startWidth + e.clientX - startX}px`;
  }
  function onPointerUp(e: PointerEvent) {
    dragging = false;
    resizer.releasePointerCapture(e.pointerId);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  }
  //
</script>

<div class="file-explorer" bind:this={explorerEl}>
  <div class="toolbar">
    <button on:click={() => addNode(selectedId, true)} class="icon-btn">
      <span class="material-icons-outlined">create_new_folder</span>
    </button>
    <button on:click={() => addNode(selectedId, false)} class="icon-btn">
      <span class="material-icons-outlined">note_add</span>
    </button>
    <button on:click={collapseAll} class="icon-btn" title="Закрыть все">
      <span class="material-icons-outlined">unfold_less</span>
    </button>
    <button on:click={expandAll} class="icon-btn" title="Открыть все">
      <span class="material-icons-outlined">unfold_more</span>
    </button>
  </div>
  
  <div class="tree" on:click={() => (selectedId = null)}>
    <VirtualList
    class="scroll-container"
    items={flatNodes}
    style="height:100%; width:100%;"
    rowHeight={24}
    >
    {#snippet vl_slot({ item })}
    <div
    class="node"
    style="padding-left: {item.depth * 16}px"
    on:click|stopPropagation={() => {
      toggle(item.node);
      if (item.node.type === 'folder') {
        selectedId = item.node.id;
      }
    }}
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

<div
  bind:this={resizer}
  class="resizer"
  on:pointerdown={onPointerDown}
  title="Перетащите, чтобы изменить ширину"
></div>
