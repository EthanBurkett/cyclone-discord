import { Client, Events as DiscordEvents } from "discord.js";
import mongoose from "mongoose";
import { CommandManager } from "@/Classes/CommandManager.ts";
import { Events } from "@/Classes/Events";
import chalk from "chalk";
import moment from "moment";
import fs from "fs";
import path from "path";

declare module "discord.js" {
  interface Client {
    log: (...args: any[]) => void;
    error: (...args: any[]) => void;
  }
}

let commandManager: CommandManager;

const client: Client = new Client({
  intents: ["Guilds", "GuildMembers", "GuildMessages", "MessageContent"],
});
const time = moment().format("YYYY-MM-DD HH:mm:ss");
const date = moment().format("YYYY-MM-DD");

const logs = {
  append: (type: "ERROR" | "INFO", ...text: string[]) => {
    fs.appendFileSync(
      path.join(process.cwd(), "logs", `${date}.log`),
      `${time} [${type}] ${text.map((t) => t).join(" ")}\n`
    );
  },
  info: (...text: string[]) => {
    return `${chalk.greenBright(time)} ${chalk.blueBright`[INFO]`} ${text
      .map((t) => t)
      .join(" ")}`;
  },
  error: (...text: string[]) => {
    return `${chalk.greenBright(time)} ${chalk.redBright`[ERROR]`} ${text
      .map((t) => t)
      .join(" ")}`;
  },
};

client.log = (...args: string[]) => {
  console.log(logs.info(...args));
  logs.append("INFO", ...args);
};
client.error = (...args: any[]) => {
  console.error(logs.error(...args));
  logs.append("ERROR", ...args);
};

client.on(DiscordEvents.ClientReady, () => {
  commandManager = new CommandManager();
  new Events(client);
});

// @ts-ignore
client
  .login(process.env.DISCORD_TOKEN)
  .then(async (t) => {
    await mongoose
      .connect("mongodb://admin:57BoxRed@10.0.0.239:27017/cyclone")
      .then(() => {
        client.log("Connected to MongoDB");
      })
      .catch((e) => client.error(e));
  })
  .catch(() => {});

export { client, commandManager };
