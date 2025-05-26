<script lang="ts">
  import "./MenuBar.css";
  import { onMount, createEventDispatcher } from "svelte";
  import { getCurrentWindow } from "@tauri-apps/api/window";

  let appWindow: any;

  onMount(() => {
    appWindow = getCurrentWindow();
  });

  const dispatch = createEventDispatcher();

  function onOpenFolder() {
    dispatch("openFolder");
  }

  const onOpenFile = () => console.log("openFile");
  const onUndo = () => console.log("undo");
</script>

<nav class="menu-bar">
  <div class="menu-item">
    File
    <div class="dropdown">
      <div class="dropdown-item" on:click={onOpenFolder}>Open Folder</div>
      <div class="dropdown-item" on:click={onOpenFile}>Open File</div>
    </div>
  </div>
  <div class="menu-item">
    Edit
    <div class="dropdown">
      <div class="dropdown-item" on:click={onUndo}>Undo</div>
    </div>
  </div>

  <div class="spacer"></div>

  <!--basic windows commands-->
  <button class="win-btn" on:click={() => appWindow.minimize()}>
    <span class="material-icons-outlined"> remove </span>
  </button>
  <button class="win-btn" on:click={() => appWindow.toggleMaximize()}>
    <span class="material-icons-outlined"> close_fullscreen </span>
  </button>
  <button class="win-btn" on:click={() => appWindow.close()}>
    <span class="material-icons-outlined"> close </span>
  </button>
</nav>
