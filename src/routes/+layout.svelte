<script lang="ts">
  import "../styles/global.css";
  import FileExplorer from "./components/FileExplorer/FileExplorer.svelte";
  import SidebarIcons from "./components/SidebarIcons.svelte";
  import "@material-design-icons/font";
  import "@fontsource/material-symbols-outlined";
  import EditorMd from "./components/EditorMd/EditorMd.svelte";
  import MenuBar from "./components/MenuBar/MenuBar.svelte";
  import ModalInfo from "../lib/Modals/Modal_Info/Modal_Info.svelte";
</script>

<main class="layout">
  <header class="titlebar">
    <MenuBar />
  </header>

  <div class="main-body">
    <ModalInfo />
    <SidebarIcons />
    <FileExplorer />
    <EditorMd
      filePath="C:\Users\hatr6\Desktop\Test\New File (55).md"
      saveInterval={10}
    />
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
    height: 100vh;
  }
  .titlebar {
    -webkit-app-region: drag;
    display: flex;
    align-items: center;
    width: 100%;
    height: var(--spacing-lg);
    background: var(--color-explorer-bg);
    border-bottom: 1px solid var(--color-resizer);
  }
  .titlebar .menu-item,
  .titlebar .dropdown-item,
  .titlebar button {
    -webkit-app-region: no-drag;
  }
</style>
