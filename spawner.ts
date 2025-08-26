import { spawn, ChildProcess } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function launchProcess(instanceIndex: number): void {
  const childProcess: ChildProcess = spawn(
    "tsx",
    ["--trace-warnings", "--async-stack-traces", "./starter.js"],
    {
      cwd: __dirname,
      stdio: "inherit",
      env: {
        ...process.env,
        INSTANCE_INDEX: instanceIndex.toString(),
      },
    }
  );

  childProcess.on("close", (exitCode: number | null) => {
    if (exitCode !== 0) {
      console.log(
        `API server process exited with code ${exitCode}. Restarting...`
      );
      launchProcess(instanceIndex);
    }
  });

  childProcess.on("error", (error: Error) => {
    console.error(`Error with child process: ${error}`);
  });
}

async function startApp(): Promise<void> {
  launchProcess(1);
}

startApp();
