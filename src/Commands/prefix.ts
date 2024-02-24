import { BothCommand } from "@/Classes/BothCommand";
import { MessageCommand } from "@/Classes/MessageCommand";
import { ApplicationCommandOptionType } from "discord.js";
import { client } from "..";

export default new BothCommand({
  description: "Changes the prefix for this server",
  name: "prefix",
  guilds: ["1207528849706065961"],
  permission: "Administrator",
  options: [
    {
      name: "new",
      description: "Change the prefix",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  callback: ({ message, interaction }) => {
    let newPrefix = "";
    if (message) {
      const args = message.content.split(" ").slice(1);
      newPrefix = args[0];
    } else if (interaction) {
      newPrefix = interaction.options?.get("new", true).value as string;
    }

    client.cache.pushKey(
      message ? message.guild?.id! : interaction?.guild?.id!,
      "prefix",
      newPrefix
    );
    return `Prefix updated to ${newPrefix}`;
  },
});
