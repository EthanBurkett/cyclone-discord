import type { Client } from "discord.js";
import { Events as DiscordEvents } from "discord.js";
import { commandManager as manager } from "@/index.ts";
import { MessageCommand } from "@/Classes/MessageCommand.ts";
import { SlashCommand } from "@/Classes/SlashCommand.ts";
import { BothCommand } from "@/Classes/BothCommand.ts";

export class Events {
  constructor(client: Client<boolean>) {
    client.on(DiscordEvents.InteractionCreate, async (interaction) => {
      if (!interaction.isCommand()) return;

      const command = manager.commands.get(interaction.commandName);
      if (!command) return;
      if (command instanceof BothCommand)
        await manager.publish<"BOTH">(interaction.commandName, {
          interaction,
        });
      if (command instanceof SlashCommand)
        await manager.publish<"SLASH">(interaction.commandName, {
          interaction,
        });
    });
    client.on(DiscordEvents.MessageCreate, async (message) => {
      const defaultPrefix = "!";
      const { content } = message;
      const args = content.split(" ");
      const prefix = args[0].substring(0, defaultPrefix.length);

      if (prefix !== defaultPrefix) return;

      const commandName = args[0].substring(
        defaultPrefix.length,
        args[0].length
      );
      const command = manager.commands.get(commandName);

      if (!command) return;
      if (command instanceof BothCommand)
        await manager.publish<"BOTH">(commandName, {
          message,
        });
      if (command instanceof MessageCommand)
        await manager.publish<"MESSAGE">(commandName, { message });

      return;
    });
  }
}
