import { useFile, useUpdateFile } from "@/features/file-explorer/use-files";
import Image from "next/image";
import {
    useEffect,
    useRef
} from "react";
import { CodeEditor } from "./code-editor";
import { FileBreadcrumbs } from "./file-breadcrumbs";
import { TopNavigation } from "./top-navigation";
import { useEditor } from "./use-editor";

const DEBOUNCE_MS = 1500;

export const EditorView = () => {
  const { activeTabId } = useEditor();
  const activeFile = useFile(activeTabId);
  const updateFile = useUpdateFile();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup pending debounced updates on unmount or file change
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [activeTabId]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center">
        <TopNavigation />
      </div>
      {activeTabId && <FileBreadcrumbs />}
      <div className="flex-1 min-h-0 bg-background">
        {!activeFile && (
          <div className="size-full flex items-center justify-center">
            <Image
              src="/globe.svg"
              alt="No file selected"
              width={50}
              height={50}
              className="opacity-25"
            />
          </div>
        )}
        {activeFile && (
          <CodeEditor
            key={activeFile.id}
            fileName={activeFile.name}
            initialValue={activeFile.content}
            onChange={(content: string) => {
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }

              timeoutRef.current = setTimeout(() => {
                updateFile({ id: activeFile.id, content });
              }, DEBOUNCE_MS);
            }}
          />
        )}
      </div>
    </div>
  );
};