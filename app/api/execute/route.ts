import { execa } from "execa";

export async function POST(request: Request) {
  try {
    const { command } = await request.json();

    if (!command || typeof command !== "string") {
      return Response.json({ error: "Invalid command" }, { status: 400 });
    }

    const allowedCommands = ["ls", "pwd", "cat", "echo", "date", "whoami"];

    const baseCommand = command.split(" ")[0];

    if (!allowedCommands.includes(baseCommand)) {
      return Response.json(
        { error: `Command '${baseCommand}' is not allowed` },
        { status: 403 }
      );
    }

    try {
      // Old way (child_process.exec)
      // exec("ls", (error, stdout, stderr) => { ... });
      const result = await execa(command, {
        shell: true,
        timeout: 5000,
      });

      return Response.json({
        output: result.stdout ? `${result.stdout}\r\n` : "",
        error: null,
      });
    } catch (error: any) {
      return Response.json({
        output: error.stdout || "",
        error: error.stderr || error.message,
      });
    }
  } catch (error) {
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
