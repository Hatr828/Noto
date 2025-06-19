<script lang="ts">
  import "./Editor.css";
  import EditorMd from "./EditorMd/EditorMd.svelte";
  import { writable } from "svelte/store";

  interface Pane {
    id: number;
    title: string;
    content: string;
  }
  const panes = writable<Pane[]>([]);
  const active = writable<number>(0);

  let nextId = 1;
  function add() {
    const p = { id: nextId, title: `Untitled-${nextId}`, content: "" };
    panes.update($ => { $.push(p); return $; });
    active.set(nextId++);
  }
  function remove(id: number) {
    panes.update($ => $.filter(p => p.id !== id));
    active.update(cur => cur === id ? panes.subscribe($ => $[0]?.id) : cur);
  }

    function handleWheel(e: WheelEvent) {
    e.preventDefault();
    const nav = e.currentTarget as HTMLElement;
    nav.scrollLeft += e.deltaY;
  }
</script>

<div class="editor-container">
  <div class="bar">
    <button on:click={add} class="new-tab-button">＋ New Tab</button>
    <nav class="tabs-nav" on:wheel={handleWheel}>
      {#each $panes as p}
        <button
          on:click={() => active.set(p.id)}
          class="tab-button {p.id === $active ? 'active' : ''}"
        >
          <span class="tab-title">{p.title}</span>
          <span
            on:click|stopPropagation={() => remove(p.id)}
            class="tab-close"
          >
            ×
          </span>
        </button>
      {/each}
    </nav>
  </div>

  <div class="content">
    {#if $panes.length === 0}
      <p class="no-tabs-message">No tabs.</p>
    {:else}
      {#each $panes as p (p.id)}
        {#if p.id === $active}
          <EditorMd
            filePath="C:\\Users\\hatr6\\Desktop\\Test\\New File (55).md"
            saveInterval={10}
          />
        {/if}
      {/each}
    {/if}
  </div>
</div>
