<script lang="ts">
    import '../styles/global.css'
    import FileExplorer from './components/FileExplorer/FileExplorer.svelte';
    import SidebarIcons from './components/SidebarIcons.svelte';
    import '@material-design-icons/font';
    import "@fontsource/material-symbols-outlined";
    import EditorMd from './components/EditorMd/EditorMd.svelte';
    import MenuBar from './components/MenuBar/MenuBar.svelte';
</script>
  
<main class="layout">
    <div class="upper-panel">
      <MenuBar />
    </div>
    <div class="main-body">
      <SidebarIcons />
      <FileExplorer/>
      <EditorMd />
    </div>
  <div class="content">
      <slot />
    </div>
</main>
  
<style>
  .layout {
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
  .main-body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
</style>
  