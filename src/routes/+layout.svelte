<script lang="ts">
    import '../styles/global.css'
    import FileExplorer from './components/FileExplorer/FileExplorer.svelte';
    import SidebarIcons from './components/SidebarIcons.svelte';
    import '@material-design-icons/font';
    import "@fontsource/material-symbols-outlined";
</script>
  
<main class="layout">

    <SidebarIcons />
    <FileExplorer/>

  <div class="content">
      <slot />
    </div>
</main>
  
<style>
  .layout {
    display: flex;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
  .content {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: auto;
    background: var(--color-bg);
  }
</style>
  