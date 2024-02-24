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
      console.log("event cb");
      if (command instanceof BothCommand)
        return await manager.publish<"BOTH">(interaction.commandName, {
          interaction,
          options: interaction.options as any,
        });
      if (command instanceof SlashCommand)
        return await manager.publish<"SLASH">(interaction.commandName, {
          interaction,
          options: interaction.options as any,
        });
    });
    client.on(DiscordEvents.MessageCreate, async (message) => {
      let prefix = "!";
      const { content } = message;
      let guildCache = client.cache.get(message.guild?.id!);
      if (guildCache && guildCache.prefix) prefix = guildCache.prefix;
      const args = content.split(" ");
      const messagePrefix = args[0].substring(0, prefix.length);

      if (messagePrefix !== prefix) return;

      const commandName = args[0].substring(prefix.length, args[0].length);
      const command = manager.commands.get(commandName);

      if (!command) return;
      console.log("event cb");
      if (command instanceof BothCommand)
        return await manager.publish<"BOTH">(commandName, {
          message,
          args: message.content.split(" "),
        });
      if (command instanceof MessageCommand)
        return await manager.publish<"MESSAGE">(commandName, {
          message,
          args: message.content.split(" "),
        });

      return;
    });
  }
}
