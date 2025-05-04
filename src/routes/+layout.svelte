<script lang="ts">
    import '../styles/global.css'
    import FileExplorer from './components/FileExplorer.svelte';
    import SidebarIcons from './components/SidebarIcons.svelte';
    import '@material-design-icons/font';
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

  /* Контент справа от FileExplorer */
  .content {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: auto;
    background: var(--color-bg);
  }
</style>
  