import { useFile } from "@/features/file-explorer/use-files";
import Image from "next/image";
import { CodeEditor } from "./code-editor";
import { FileBreadcrumbs } from "./file-breadcrumbs";
import { TopNavigation } from "./top-navigation";
import { useEditor } from "./use-editor";

export const EditorView = () => {
  const { activeTabId } = useEditor();
  const activeFile = useFile(activeTabId);

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
          />
        )}
      </div>
    </div>
  );
};