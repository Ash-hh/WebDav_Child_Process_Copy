import { execSync } from "child_process";
import * as readline from "readline";
import { stdin as input, stdout as output } from "process";
import * as prompts from "prompts";
import { ChildProceeModule } from "./readFile";

const readLine = readline.createInterface({ input, output });

const rootDir = "/home/alexis";

const StopValue = "Stop";

let path = process.cwd();

let distDir: string;

let currentDirFilesCommand = `ls -F ${path}`;

type Choices = {
  name: string;
  value: string;
};

const fileReader = new ChildProceeModule();

async function main() {
  console.log("Current directory: ", process.cwd());
  console.log("Want to change directory?");

  const result = await readPositiveNeagtive();

  if (result) {
    path = await changeDirectory();
    currentDirFilesCommand = "ls -F " + path;
  }

  await fileReader.start();

  const filesToCopy = readFilesToCopy(currentDirFilesCommand);

  await endOfCopySession(filesToCopy);

  await fileReader.stop();
}

main();

function endOfCopySession(filesToCopy: Choices[]): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    let newFilesToCopy = filesToCopy;

    while (true) {
      const choice = await setFileToCopy(newFilesToCopy);

      if (choice === StopValue) {
        resolve();
        return;
      }

      fileReader.copy(path + "/" + choice, choice);

      newFilesToCopy = newFilesToCopy.filter((file) => file.name != choice);
    }
  });
}

async function setFileToCopy(filesToCopy: Choices[]): Promise<string> {
  const response = await prompts({
    type: "select",
    name: "name",
    message: "Select file to copy",
    choices: filesToCopy,
  });
  return response.name;
}

function readFilesToCopy(command: string): Choices[] {
  const files = execSync(command).toString().split("\n");

  files.push(StopValue);

  return files
    .filter((file) => file.length > 0 && file.indexOf("/") === -1)
    .map((file) => {
      return { name: file, value: file };
    });
}

const changeDirectory = () =>
  new Promise<string>(async (resolve, reject) => {
    try {
      const newDirPath = await promiseQuestion("Input new path to directory: ");
      const correctPath = validatePath(newDirPath);
      const files = execSync("ls " + correctPath);
      console.log("Is there files you need to copy?");
      console.log(files.toString());
      if (await readPositiveNeagtive()) {
        resolve(correctPath);
        return;
      }
      changeDirectory();
      return;
    } catch (error) {
      console.log(error.message);
      console.log("Input directory");
      changeDirectory();
      return;
    }
  });

async function readPositiveNeagtive() {
  while (true) {
    const answer = await promiseQuestion("Y/N: ");

    if (answer === "Y" || answer === "N") {
      return answer === "Y" ? true : false;
    }
  }
}

function promiseQuestion(question: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    readLine.question(question, (answer) => {
      resolve(answer);
    });
  });
}

function validatePath(path: string): string {
  if (path.startsWith("~")) {
    return rootDir + path.substring(1);
  }

  return path;
}
