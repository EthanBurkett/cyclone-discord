import { replyFromCallback } from "@/utils";
import type { Command, CommandCallback } from "@types";
import type {
  ApplicationCommandOptionData,
  CacheType,
  ChatInputCommandInteraction,
  CommandInteraction,
  PermissionsString,
} from "discord.js";
import { BaseCommand } from "./BaseCommand";

export class SlashCommand extends BaseCommand<"SLASH"> {
  constructor(options: Command<false, "SLASH">) {
    super(options);
  }

  public async execute(interaction: ChatInputCommandInteraction<CacheType>) {
    if (this._permission) {
      if (!interaction.memberPermissions?.has(this._permission)) return;
    }
    const reply = await this.callback({ interaction });

    replyFromCallback(reply, interaction, this);
  }
}
