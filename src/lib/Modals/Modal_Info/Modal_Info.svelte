<script lang="ts">
    import { onDestroy } from "svelte";
    import { modalStore, hideModal, type ModalData } from "./Modal_Info";
    import "./Modal_Info.css";

    let visible: boolean = false;
    let header: string = "";
    let args: Array<[string, string]> = [];

    const unsubscribe = modalStore.subscribe((data: ModalData) => {
        visible = data.visible;
        header = data.header;
        args = data.args;
    });

    onDestroy(() => {
        unsubscribe();
    });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
{#if visible}
    <div class="modal-overlay" on:click={hideModal}>
        <div class="modal-window" on:click|stopPropagation>
            <div class="modal-header">
                <h2>{header}</h2>
                <button class="close-button" on:click={hideModal}
                    >&times;</button
                >
            </div>
            <div class="modal-body table-container">
                <table>
                    {#each args as [key, value] (key)}
                        <tr>
                            <td class="row-key">{key}</td>
                            <td class="row-value">{value}</td>
                        </tr>
                    {/each}
                </table>
            </div>

            <div class="modal-footer">
                <button class="ok-button" on:click={hideModal}>OK</button>
            </div>
        </div>
    </div>
{/if}
