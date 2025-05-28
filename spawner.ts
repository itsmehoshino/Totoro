import { spawn, ChildProcess } from "child_process";
import express from "express";
import path from "path";
import net from "net";
import { fileURLToPath } from "url";
import cors from "cors";

const __dirname = fileURLToPath(import.meta.url);
const app: express.Application = express();

const generateRandomPort = (): number =>
  Math.floor(Math.random() * (65535 - 1024) + 1024);
let activePort: number = generateRandomPort();

app.use(cors());
app.use(express.static(path.join(__dirname, "views")));

async function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once("error", () => resolve(false))
      .once("listening", () => {
        tester.once("close", () => resolve(true)).close();
      })
      .listen(port, "127.0.0.1");
  });
}

async function initializeServer(port: number): Promise<void> {
  try {
    const isAvailable: boolean = await isPortInUse(port);
    if (!isAvailable) {
      const newPort: number = generateRandomPort();
      console.log(`Port ${port} is in use. Switching to port ${newPort}`);
      activePort = newPort;
      return initializeServer(newPort);
    }

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error: unknown) {
    console.error(`Failed to start the server: ${error}`);
  }
}

function launchProcess(instanceIndex: number): void {
  const childProcess: ChildProcess = spawn(
    "tsx",
    ["--trace-warnings", "--async-stack-traces", "./source/main.ts"],
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
  await initializeServer(activePort);
  launchProcess(1);
}

startApp();