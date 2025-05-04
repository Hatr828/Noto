<script lang="ts">
    import { createEventDispatcher } from 'svelte';
  
    const dispatch = createEventDispatcher<{ navigate: string }>();
  
    const items: { icon: string; route: string; title: string }[] = [
      { icon: '🏠', route: '/', title: 'Home' },
      { icon: '📄', route: '/notes', title: 'Notes' },
      { icon: '⚙️', route: '/settings', title: 'Settings' }
    ];
  
    function onClick(route: string) {
      dispatch('navigate', route);
    }
</script>
  
<style>
    .sidebar {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--spacing-sm) 0;
        background: var(--color-sidebar-bg);
        width: 48px;
        height: 100%; 
        color: var(--color-text);
    }
    .item {
      font-size: 1.5rem;
      margin: var(--spacing-md) 0;
      cursor: pointer;
      color: var(--color-text);
      transition: color 0.2s;
    }
    .item:hover {
      color: var(--color-primary);
    }
</style>
  
<div class="sidebar">
    {#each items as { icon, route, title }}
      <div
        class="item"
        role="button"
        aria-label={title}
        on:click={() => onClick(route)}
        title={title}
      >
        {icon}
      </div>
    {/each}
</div>