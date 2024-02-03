import { replyFromCallback } from "@/utils";
import type { Command, CommandCallback } from "@types";
import type {
  ApplicationCommandOptionData,
  CacheType,
  ChatInputCommandInteraction,
  CommandInteraction,
  Message,
  PermissionsString,
} from "discord.js";
import { BaseCommand } from "./BaseCommand";

export class BothCommand extends BaseCommand<"BOTH"> {
  constructor(options: Command<false, "BOTH">) {
    super(options);
  }

  public async execute(
    message: Message<boolean> | null,
    interaction: ChatInputCommandInteraction<CacheType> | null
  ) {
    if (this._permission) {
      if (message) {
        if (!message.member?.permissions.has(this._permission)) return;
      } else {
        if (!interaction?.memberPermissions?.has(this._permission)) return;
      }
    }

    const reply = await this.callback({
      message: message as any,
      interaction: interaction as any,
    });

    await replyFromCallback(reply, message ? message : interaction, this);
  }
}
