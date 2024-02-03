import { BothCommand } from "@/Classes/BothCommand";
import { MessageCommand } from "@/Classes/MessageCommand";
import { SlashCommand } from "@/Classes/SlashCommand";
import {
  ApplicationCommandOptionType,
  type MessagePayloadOption,
} from "discord.js";

export default new BothCommand({
  description: "test",
  name: "ping",
  guilds: ["1147975844619354226"],
  permission: "Administrator",
  options: [],
  callback: ({ interaction }) => {
    return {
      content: "test!",
    } as MessagePayloadOption;
  },
});
