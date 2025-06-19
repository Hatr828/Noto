<script lang="ts">
  import "../styles/global.css";
  import FileExplorer from "./components/FileExplorer/FileExplorer.svelte";
  import SidebarIcons from "./components/SidebarIcons.svelte";
  import "@material-design-icons/font";
  import "@fontsource/material-symbols-outlined";
  import EditorMd from "./components/Editor/EditorMd/EditorMd.svelte";
  import MenuBar from "./components/MenuBar/MenuBar.svelte";
  import ModalInfo from "../lib/Modals/Modal_Info/Modal_Info.svelte";
  import Editor from "./components/Editor/Editor.svelte";
</script>

<main class="layout">
  <header class="titlebar">
    <MenuBar />
  </header>

  <div class="main-body">
    <ModalInfo />
    <SidebarIcons />
    <FileExplorer />
    <Editor />
    <!-- <EditorMd
      filePath="C:\Users\hatr6\Desktop\Test\New File (55).md"
      saveInterval={10}
    /> -->
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
    min-height: 0;
    overflow: hidden;
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
