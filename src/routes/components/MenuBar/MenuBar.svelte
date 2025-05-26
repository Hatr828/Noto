<script lang="ts">
  import './MenuBar.css';

  const onOpenFolder = () => console.log('openFolder');
  const onOpenFile   = () => console.log('openFile');
  const onUndo       = () => console.log('undo');
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
</nav>
