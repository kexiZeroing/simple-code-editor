import { cn } from "@/lib/utils";
import { FileIcon, FolderIcon } from "@react-symbols/icons/utils";
import { ChevronRightIcon } from "lucide-react";
import { useState } from "react";

import { useEditor } from "@/features/editor/use-editor";
import { getItemPadding } from "./constants";
import { CreateInput } from "./create-input";
import { RenameInput } from "./rename-input";
import { TreeItemWrapper } from "./tree-item-wrapper";
import {
  FileItem,
  useCreateFile,
  useCreateFolder,
  useDeleteFile,
  useFolderContents,
  useLoadFileContent,
  useRenameFile,
} from "./use-files";

export const Tree = ({
  item,
  level = 0,
}: {
  item: FileItem;
  level?: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [creating, setCreating] = useState<"file" | "folder" | null>(null);

  const loadFileContent = useLoadFileContent();
  const renameFile = useRenameFile();
  const deleteFile = useDeleteFile();
  const createFile = useCreateFile();
  const createFolder = useCreateFolder();

  const folderContents = useFolderContents({
    parentId: item.id,
    enabled: item.type === "folder" && isOpen,
  });

  const { openFile, closeTab, activeTabId } = useEditor();

  const handleRename = (newName: string) => {
    setIsRenaming(false);

    if (newName === item.name) {
      return;
    }

    renameFile({ id: item.id, newName });
  };

  const handleCreate = (name: string) => {
    setCreating(null);

    if (creating === "file") {
      createFile({
        name,
        content: "",
        parentId: item.id,
      });
    } else {
      createFolder({
        name,
        parentId: item.id,
      });
    }
  };

  const startCreating =(type: "file" | "folder") => {
    setIsOpen(true);
    setCreating(type);
  };

  const handleFileOpen = async (pinned: boolean) => {
    if (item.content === undefined) {
      await loadFileContent(item.id, async () => {
        const res = await fetch('/api/readme');
        const data = await res.json();
        return data.content;
      });
    }
    openFile(item.id, { pinned });
  };

  if (item.type === "file") {
    const fileName = item.name;
    const isActive = activeTabId === item.id;

    if (isRenaming) {
      return (
        <RenameInput
          type="file"
          defaultValue={fileName}
          level={level}
          onSubmit={handleRename}
          onCancel={() => setIsRenaming(false)}
        />
      );
    }

    return (
      <TreeItemWrapper
        item={item}
        level={level}
        isActive={isActive}
        onClick={() => handleFileOpen(false)}
        onDoubleClick={() => handleFileOpen(true)}
        onRename={() => setIsRenaming(true)}
        onDelete={() => {
          closeTab(item.id);
          deleteFile({ id: item.id });
        }}
      >
        <FileIcon fileName={fileName} autoAssign className="size-4" />
        <span className="truncate text-sm">{fileName}</span>
      </TreeItemWrapper>
    )
  }

  const folderName = item.name;

  const folderRender = (
    <>
      <div className="flex items-center gap-0.5">
        <ChevronRightIcon
          className={cn(
            "size-4 shrink-0 text-muted-foreground",
            isOpen && "rotate-90"
          )}
        />
        <FolderIcon folderName={folderName} className="size-4" />
      </div>
      <span className="truncate text-sm">{folderName}</span>
    </>
  )

  if (creating) {
    return (
      <>
        <button
          onClick={() => setIsOpen((value) => !value)}
          className="group flex items-center gap-1 h-5.5 hover:bg-accent/30 w-full"
          style={{ paddingLeft: getItemPadding(level, false) }}
        >
          {folderRender}
        </button>
        {isOpen && (
          <>
            <CreateInput
              type={creating}
              level={level + 1}
              onSubmit={handleCreate}
              onCancel={() => setCreating(null)}
            />
            {folderContents?.map((subItem) => (
              <Tree
                key={subItem.id}
                item={subItem}
                level={level + 1}
              />
            ))}
          </>
        )}
      </>
    )
  }

  if (isRenaming) {
    return (
      <>
        <RenameInput
          type="folder"
          defaultValue={folderName}
          isOpen={isOpen}
          level={level}
          onSubmit={handleRename}
          onCancel={() => setIsRenaming(false)}
        />
        {isOpen && (
          <>
            {folderContents?.map((subItem) => (
              <Tree
                key={subItem.id}
                item={subItem}
                level={level + 1}
              />
            ))}
          </>
        )}
      </>
    )
  }

  return (
    <>
      <TreeItemWrapper
        item={item}
        level={level}
        onClick={() => setIsOpen((value) => !value)}
        onRename={() => setIsRenaming(true)}
        onDelete={() => deleteFile({ id: item.id })}
        onCreateFile={() => startCreating("file")}
        onCreateFolder={() => startCreating("folder")}
      >
        {folderRender}
      </TreeItemWrapper>
      {isOpen && (
        <>
          {folderContents?.map((subItem) => (
            <Tree
              key={subItem.id}
              item={subItem}
              level={level + 1}
            />
          ))}
        </>
      )}
    </>
  );
};