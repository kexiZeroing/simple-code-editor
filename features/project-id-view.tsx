"use client";

import { cn } from "@/lib/utils";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import { useEffect, useState } from "react";

import { EditorView } from "@/features/editor/editor-view";
import { FileExplorer } from "@/features/file-explorer";
import { PreviewView } from "@/features/preview/preview-view";

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 800;
const DEFAULT_SIDEBAR_WIDTH = 300;
const DEFAULT_MAIN_SIZE = 1000;

const Tab = ({
  label,
  isActive,
  onClick
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 h-full px-3 cursor-pointer text-muted-foreground border-r hover:bg-accent/30",
        isActive && "bg-background text-foreground"
      )}
    >
      <span className="text-sm">{label}</span>
    </div>
  );
};

export const ProjectIdView = () => {
  const [activeView, setActiveView] = useState<"editor" | "preview">("editor");
  const [mounted, setMounted] = useState(false);

  // Prevents the stacking issue by waiting for the DOM to be ready before Allotment calculates dimensions.
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <nav className="h-8.75 flex items-center bg-sidebar border-b">
        <Tab
          label="Code"
          isActive={activeView === "editor"}
          onClick={() => setActiveView("editor")}
        />
        <Tab
          label="Preview"
          isActive={activeView === "preview"}
          onClick={() => setActiveView("preview")}
        />
      </nav>
      <div className="flex-1 relative">
        <div className={cn(
          "absolute inset-0",
          activeView === "editor" ? "visible" : "invisible"
        )}>
          {mounted && (
            <Allotment defaultSizes={[DEFAULT_SIDEBAR_WIDTH, DEFAULT_MAIN_SIZE]}>
              <Allotment.Pane
                snap
                minSize={MIN_SIDEBAR_WIDTH}
                maxSize={MAX_SIDEBAR_WIDTH}
                preferredSize={DEFAULT_SIDEBAR_WIDTH}
              >
                <FileExplorer />
              </Allotment.Pane>
              <Allotment.Pane>
                <EditorView />
              </Allotment.Pane>
            </Allotment>
          )}
        </div>
        <div className={cn(
          "absolute inset-0",
          activeView === "preview" ? "visible" : "invisible"
        )}>
          <PreviewView />
        </div>
      </div>
    </div>
  );
};