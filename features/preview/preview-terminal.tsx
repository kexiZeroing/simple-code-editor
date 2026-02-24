"use client";

import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import { useEffect, useRef } from "react";

import "@xterm/xterm/css/xterm.css";

interface PreviewTerminalProps {}

export const PreviewTerminal = ({}: PreviewTerminalProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!containerRef.current || terminalRef.current) return;

    // https://xtermjs.org/docs/api/terminal/interfaces/iterminaloptions
    const terminal = new Terminal({
      convertEol: true,
      fontSize: 13,
      fontFamily: "Menlo, Monaco, 'Courier New', monospace",
      theme: {
        background: "#1f2228",
        foreground: "#e8e8e8",
      },
      cursorBlink: true,
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(containerRef.current);

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    terminal.write("Welcome to the terminal\r\n");
    terminal.write("$ ");

    // Handle user input
    let command = "";

    const showPrompt = () => {
      terminal.write("$ ");
    };

    terminal.onData((data) => {
      if (data === "\r") {
        // Enter key pressed
        terminal.write("\r\n");
        handleCommand(command, terminal, showPrompt);
        command = "";
      } else if (data === "\u007F") {
        // Backspace
        if (command.length > 0) {
          command = command.slice(0, -1);
          // \b  Backspace character (moves cursor left)
          // ' ' Space character (overwrites the previous character)
          // \b  Another backspace (moves cursor back to correct position)
          terminal.write("\b \b");
        }
      } else {
        // Regular character
        command += data;
        terminal.write(data);
      }
    });

    requestAnimationFrame(() => fitAddon.fit());

    const resizeObserver = new ResizeObserver(() => fitAddon.fit());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      terminal.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
    };
  }, []);

  const handleCommand = async (cmd: string, terminal: Terminal, showPrompt: () => void) => {
    const trimmedCmd = cmd.trim();

    if (!trimmedCmd) {
      showPrompt();
      return;
    }

    if (trimmedCmd === "clear") {
      terminal.clear();
      showPrompt();
      return;
    }
    
    // Try to execute command via API
    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: trimmedCmd }),
      });

      const data = await response.json();

      if (data.output) {
        terminal.write(data.output);
      }
      if (data.error) {
        terminal.write(`Error: ${data.error}\r\n`);
      }
    } catch (error) {
      terminal.write(`Command not found: ${trimmedCmd}\r\n`);
    }
    
    showPrompt();
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 p-3 [&_.xterm]:h-full! [&_.xterm-viewport]:h-full! [&_.xterm-screen]:h-full! bg-sidebar"
    />
  );
};