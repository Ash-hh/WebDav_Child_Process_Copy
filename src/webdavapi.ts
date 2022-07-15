import { createReadStream } from "fs";
import { createClient, WebDAVClient } from "webdav";
import { FileInfo } from "./commonTypes";
import { pipeline } from "stream/promises";

const config = require("../secrets.json");

export class WebDavApi {
  private readonly client: WebDAVClient;

  constructor() {
    this.client = createClient(config.WEBDAV_PROVIDER, {
      username: config.CLIENT_USERNAME,
      password: config.CLIENT_PASSWORD,
    });
  }

  async uploadStream(file: FileInfo) {
    return new Promise<void>((resolve, reject) => {
      const write = createReadStream(file.path);
      const read = this.client.createWriteStream("/shared/" + file.fileName);
      pipeline(write, read)
        .then(() => {
          
          resolve();
        })
        .catch(reject);
    });
  }
}
