import { replyFromCallback } from "@/utils";
import type { Command, CommandCallback } from "@types";
import {
  Message,
  type ApplicationCommandOptionData,
  type PermissionsString,
} from "discord.js";
import { BaseCommand } from "./BaseCommand";

export class MessageCommand extends BaseCommand<"MESSAGE"> {
  constructor(options: Command<false, "MESSAGE">) {
    super(options);
  }

  public async execute(message: Message<boolean>) {
    if (this._permission) {
      if (!message.member?.permissions.has(this._permission)) return;
    }

    const reply = await this.callback({
      message,
      args: message.content.split(" "),
    });

    replyFromCallback(reply, message, this);
  }
}
