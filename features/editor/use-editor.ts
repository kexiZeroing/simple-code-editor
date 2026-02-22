import { create } from "zustand";

interface EditorStore {
  openTabs: string[];
  activeTabId: string | null;
  previewTabId: string | null;

  openFile: (fileId: string, options: { pinned: boolean }) => void;
  closeTab: (fileId: string) => void;
  closeAllTabs: () => void;
  setActiveTab: (fileId: string) => void;
}

const useEditorStore = create<EditorStore>()((set, get) => ({
  openTabs: [],
  activeTabId: null,
  previewTabId: null,

  openFile: (fileId, { pinned }) => {
    const { openTabs, previewTabId } = get();
    const isOpen = openTabs.includes(fileId);

    // Case 1: Opening as preview - replace existing preview or add new
    if (!isOpen && !pinned) {
      const newTabs = previewTabId
        ? openTabs.map((id) => (id === previewTabId) ? fileId : id)
        : [...openTabs, fileId];

      set({
        openTabs: newTabs,
        activeTabId: fileId,
        previewTabId: fileId,
      });
      return;
    }

    // Case 2: Opening as pinned - add new tab
    if (!isOpen && pinned) {
      set({
        openTabs: [...openTabs, fileId],
        activeTabId: fileId,
        previewTabId: null,
      });
      return;
    }

    // Case 3: File already open - just activate (and pin if double-clicked)
    const shouldPin = pinned && previewTabId === fileId;
    set({
      activeTabId: fileId,
      previewTabId: shouldPin ? null : previewTabId,
    });
  },

  closeTab: (fileId) => {
    const { openTabs, activeTabId, previewTabId } = get();
    const tabIndex = openTabs.indexOf(fileId);

    if (tabIndex === -1) return;

    const newTabs = openTabs.filter((id) => id !== fileId);

    let newActiveTabId = activeTabId;
    if (activeTabId === fileId) {
      if (newTabs.length === 0) {
        newActiveTabId = null;
      } else if (tabIndex >= newTabs.length) {
        newActiveTabId = newTabs[newTabs.length - 1];
      } else {
        newActiveTabId = newTabs[tabIndex];
      }
    }

    set({
      openTabs: newTabs,
      activeTabId: newActiveTabId,
      previewTabId: previewTabId === fileId ? null : previewTabId,
    });
  },

  closeAllTabs: () => {
    set({
      openTabs: [],
      activeTabId: null,
      previewTabId: null,
    });
  },

  setActiveTab: (fileId) => {
    set({ activeTabId: fileId });
  },
}));

export const useEditor = () => {
  const openTabs = useEditorStore((state) => state.openTabs);
  const activeTabId = useEditorStore((state) => state.activeTabId);
  const previewTabId = useEditorStore((state) => state.previewTabId);
  const openFile = useEditorStore((state) => state.openFile);
  const closeTab = useEditorStore((state) => state.closeTab);
  const closeAllTabs = useEditorStore((state) => state.closeAllTabs);
  const setActiveTab = useEditorStore((state) => state.setActiveTab);

  return {
    openTabs,
    activeTabId,
    previewTabId,
    openFile,
    closeTab,
    closeAllTabs,
    setActiveTab,
  };
};