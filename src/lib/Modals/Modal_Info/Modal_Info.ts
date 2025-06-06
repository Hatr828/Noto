import { writable, type Writable } from "svelte/store";

export interface ModalData {
  visible: boolean;
  header: string;
  args: Array<[string, string]>;
}

const defaultData: ModalData = {
  visible: false,
  header: "",
  args: [],
};

export const modalStore: Writable<ModalData> = writable(defaultData);

export function showModal(
  header: string,
  args: Array<[string, string]>
): void {
  modalStore.set({ visible: true, header, args });
}

export function hideModal(): void {
  modalStore.set(defaultData);
}
