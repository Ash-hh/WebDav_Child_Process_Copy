import {
  FileInfo,
  Message,
  MessageFromMain,
  MessageTypes,
} from "./commonTypes";
import { EventEmitter } from "events";
import { WebDavApi } from "./webdavapi";

const eventEmitter = new EventEmitter();

const client = new WebDavApi();

const queue = new Array<FileInfo>();

process.on("message", (message) => {
  try {
    const result: MessageFromMain = JSON.parse(message as string);

    if (result.type === MessageTypes.COPY) {
      const file: FileInfo = {
        path: result.path,
        fileName: result.fileName,
      };

      queue.push(file);
      eventEmitter.emit("startCopy", file);
      return;
    }

    if (result.type === MessageTypes.GETCOUNT) {
      process.send(toJson(MessageTypes.GETCOUNT, queue.length));
      console.log("send queue");
    }
  } catch (err) {
    process.send(toJson(MessageTypes.ERROR, -1, err.toString()));
  }
});

eventEmitter.on("startCopy", async (file: FileInfo) => {
  await client.uploadStream(file);
  const fileName = queue.pop().fileName;
  console.log(`${fileName} donwload complete`)
  process.send(toJson(MessageTypes.SUCCESS, queue.length));
});

function toJson(
  type: MessageTypes,
  count?: number,
  errorMessage?: string
): string {
  const resultValue: Message = {
    type,
    count,
    errorMessage,
  };

  return JSON.stringify(resultValue);
}
