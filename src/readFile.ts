import { ChildProcess, fork, Serializable } from "child_process";
import { Message, MessageTypes } from "./commonTypes";

export class ChildProceeModule {
  private forkedProcess: ChildProcess;

  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.forkedProcess = fork(
        "/home/alexis/Projects/FileReading/dist/fork.js"
      );

      this.forkedProcess.addListener("spawn", this.spawnListener);

      this.forkedProcess.addListener("message", this.messageListener);

      this.forkedProcess.on("spawn", () => {
        resolve();
      });

      this.forkedProcess.on("error", () => {
        reject();
      });
    });
  }

  public copy(path: string, fileName: string) {
    if (
      !this.forkedProcess.send(
        JSON.stringify({
          type: MessageTypes.COPY,
          path: path,
          fileName: fileName,
        })
      )
    ) {
      throw new Error("message dont recieved");
    }
  }

  public async waitingEndOfCopy(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.forkedProcess.on("message", (message) => {
        const result: Message = JSON.parse(message as string);

        if (result.count == 0) {
          resolve();
        }
      });

      this.forkedProcess.send(JSON.stringify({ type: MessageTypes.GETCOUNT }));
    });
  }

  public async stop(): Promise<void> {
    await this.waitingEndOfCopy();

    this.forkedProcess.kill("SIGTERM");
    console.log("child process killed");
  }

  private messageListener(message: Serializable) {
    const result: Message = JSON.parse(message as string);

    if (result.type === MessageTypes.ERROR) {
      throw new Error(result.errorMessage as string);
    }
  }

  private spawnListener() {
    console.log("spawned");
  }
}
