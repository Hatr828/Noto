<script lang="ts">
</script>

<div class="sidebar">
  <div class="item">
    <span class="material-icons-outlined">home</span>
  </div>
  <div class="item">
    <span class="material-icons-outlined">settings</span>
  </div>
</div>

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
    border-right: 2px solid var(--color-border);
    box-sizing: border-box;
  }

  .item {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: var(--spacing-sm) 0;
    cursor: pointer;
    color: var(--color-text);
    transition:
      background-color 0.2s,
      color 0.2s;
    border-radius: 0;
  }

  .item + .item {
    margin-top: var(--spacing-md);
  }

  .item:hover {
    background-color: var(--color-hover);
    color: var(--color-bg);
  }

  .item .material-icons-outlined {
    font-size: 1.8rem;
  }
</style>
