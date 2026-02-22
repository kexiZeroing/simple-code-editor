'use client';

import { useCallback, useEffect, useState } from 'react';

export type FileItem = {
  id: string;
  parentId?: string;
  name: string;
  type: 'file' | 'folder';
  updatedAt: number;
  content?: string;
};

type FileStore = {
  files: Map<string, FileItem>;
  listeners: Set<() => void>;
};

const fileStore: FileStore = {
  files: new Map(),
  listeners: new Set(),
};

const notifyListeners = () => {
  fileStore.listeners.forEach((listener) => listener());
};

/**
 * Initialize fileStore with default folder and file structure
 * This provides a helpful starting state without needing manual creation each time
 */
const initializeDefaultFiles = () => {
  const now = Date.now();

  const srcFolderId = crypto.randomUUID();
  const componentsFolderId = crypto.randomUUID();

  const files: FileItem[] = [
    {
      id: srcFolderId,
      name: 'src',
      type: 'folder',
      updatedAt: now,
    },
    {
      id: componentsFolderId,
      name: 'components',
      type: 'folder',
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      parentId: srcFolderId,
      name: 'index.ts',
      type: 'file',
      content: `export const hello = "world";`,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      parentId: componentsFolderId,
      name: 'Button.tsx',
      type: 'file',
      content: `export const Button = () => <button>Click me</button>;`,
      updatedAt: now,
    },
  ];

  files.forEach((file) => {
    fileStore.files.set(file.id, file);
  });
};

initializeDefaultFiles();

// Sort: folders first, then files, alphabetically within each group
const sortFiles = <T extends { type: 'file' | 'folder'; name: string }>(
  files: T[]
): T[] => {
  return [...files].sort((a, b) => {
    if (a.type === 'folder' && b.type === 'file') return -1;
    if (a.type === 'file' && b.type === 'folder') return 1;
    return a.name.localeCompare(b.name);
  });
};

const getFilesByParent = (parentId?: string): FileItem[] => {
  return Array.from(fileStore.files.values()).filter(
    (file) => file.parentId === parentId
  );
};

const getFileById = (fileId: string): FileItem | undefined => {
  return fileStore.files.get(fileId);
};

/**
 * Subscribes to global fileStore changes and triggers re-renders
 * 
 * Problem: fileStore is a global object outside React's state system.
 * Direct modifications won't trigger re-renders automatically.
 * 
 * Solution: Register a listener that updates component state when store changes.
 * When notifyListeners() is called 
 * → setVersion updates 
 * → component re-renders
 * → hook fetches fresh data from fileStore
 * 
 * More conventional approaches use Redux or Zustand/Jotai
 */
const useFileStoreSubscription = () => {
  const [, setVersion] = useState(0);

  useEffect(() => {
    const listener = () => setVersion((v) => v + 1);
    fileStore.listeners.add(listener);
    return () => {
      fileStore.listeners.delete(listener);
    };
  }, []);
};

export const useFiles = () => {
  useFileStoreSubscription();
  return sortFiles(getFilesByParent());
};

export const useFile = (fileId: string | null) => {
  useFileStoreSubscription();

  if (!fileId) return undefined;

  return getFileById(fileId);
};

export const useFolderContents = (config: {
  parentId?: string;
  enabled?: boolean;
} = {}) => {
  useFileStoreSubscription();

  if (!config.enabled) return undefined;

  return sortFiles(getFilesByParent(config.parentId));
};

export const useUpdateFile = () => {
  return useCallback(
    (args: {
      id: string;
      content?: string;
      name?: string;
    }) => {
      const file = getFileById(args.id);
      if (!file) return;

      const updated = {
        ...file,
        ...(args.content !== undefined && { content: args.content }),
        ...(args.name !== undefined && { name: args.name }),
        updatedAt: Date.now(),
      };

      fileStore.files.set(args.id, updated);
      notifyListeners();
    },
    []
  );
};

export const useCreateFile = () => {
  return useCallback(
    (args: {
      parentId?: string;
      name: string;
      content?: string;
    }) => {
      const id = crypto.randomUUID();
      const now = Date.now();

      const newFile: FileItem = {
        id: id,
        parentId: args.parentId,
        name: args.name,
        type: 'file',
        content: args.content || '',
        updatedAt: now,
      };

      fileStore.files.set(id, newFile);
      notifyListeners();
      return id;
    },
    []
  );
};

export const useCreateFolder = () => {
  return useCallback(
    (args: {
      parentId?: string;
      name: string;
    }) => {
      const id = crypto.randomUUID();
      const now = Date.now();

      const newFolder: FileItem = {
        id: id,
        parentId: args.parentId,
        name: args.name,
        type: 'folder',
        updatedAt: now,
      };

      fileStore.files.set(id, newFolder);
      notifyListeners();
      return id;
    },
    []
  );
};

export const useRenameFile = () => {
  return useCallback(
    (args: {
      id: string;
      newName: string;
    }) => {
      const file = getFileById(args.id);
      if (!file) return;

      const updated = {
        ...file,
        name: args.newName,
        updatedAt: Date.now(),
      };

      fileStore.files.set(args.id, updated);
      notifyListeners();
    },
    []
  );
};

export const useDeleteFile = () => {
  return useCallback(
    (args: {
      id: string;
    }) => {
      const file = getFileById(args.id);
      if (!file) return;

      // If it's a folder, recursively delete all contents
      if (file.type === 'folder') {
        const toDelete = [args.id];
        let i = 0;

        while (i < toDelete.length) {
          const currentId = toDelete[i];
          const children = Array.from(fileStore.files.values()).filter(
            (f) => f.parentId === currentId
          );

          children.forEach((child) => {
            toDelete.push(child.id);
          });

          i++;
        }

        toDelete.forEach((id) => {
          fileStore.files.delete(id);
        });
      } else {
        fileStore.files.delete(args.id);
      }

      notifyListeners();
    },
    []
  );
};

/**
 * Builds the full path to a file by traversing up the parent chain.
 *
 * Input:  A file ID (optional)
 * Output: Array of ancestors from root to file: [{ id, name: "src" }, { id, name: "components" }, { id, name: "button.tsx" }]
 *
 * Used for: Breadcrumbs navigation (src > components > button.tsx)
 */
export const useFilePath = (fileId: string | null) => {
  useFileStoreSubscription();

  if (!fileId) return [];

  const path: FileItem[] = [];
  let currentId: string | undefined = fileId;

  while (currentId) {
    const file = getFileById(currentId);
    if (!file) break;

    path.unshift(file);
    currentId = file.parentId;
  }

  return path;
};
