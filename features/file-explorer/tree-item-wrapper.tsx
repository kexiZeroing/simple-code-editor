import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger
} from "@/components/ui/context-menu";

import { getItemPadding } from "./constants";
import { FileItem } from "./use-files";

export const TreeItemWrapper = ({
  item,
  children,
  level,
  onClick,
  onRename,
  onDelete,
  onCreateFile,
  onCreateFolder,
}: {
  item: FileItem;
  children: React.ReactNode;
  level: number;
  onClick?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onCreateFile?: () => void;
  onCreateFolder?: () => void;
}) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          onClick={onClick}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onRename?.();
            }
          }}
          className="group flex items-center gap-1 w-full h-5.5 hover:bg-accent/30 outline-none focus:ring-1 focus:ring-inset focus:ring-ring"
          style={{ paddingLeft: getItemPadding(level, item.type === "file") }}
        >
          {children}
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="w-64"
      >
        {item.type === "folder" && (
          <>
            <ContextMenuItem 
              onClick={onCreateFile}
              className="text-sm"
            >
              New File
            </ContextMenuItem>
            <ContextMenuItem 
              onClick={onCreateFolder}
              className="text-sm"
            >
              New Folder
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
         <ContextMenuItem 
          onClick={onRename}
          className="text-sm"
        >
          Rename
        </ContextMenuItem>
         <ContextMenuItem 
          onClick={onDelete}
          className="text-sm"
        >
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};