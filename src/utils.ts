import type { ValidCommand } from "@types";
import {
  type MessagePayloadOption,
  EmbedBuilder,
  MessagePayload,
  ChatInputCommandInteraction,
  type CacheType,
  Message,
} from "discord.js";

import { client } from "@/index";

export const replyFromCallback = async (
  reply: string | void | MessagePayload | EmbedBuilder,
  msgOrInter: ChatInputCommandInteraction<CacheType> | Message<boolean> | null,
  command: ValidCommand
) => {
  if (!reply) return;
  if (typeof reply === "string") {
    await msgOrInter?.reply({ content: reply }).catch(() => {});
  }
  if (reply instanceof EmbedBuilder) {
    await msgOrInter?.reply({ embeds: [reply] }).catch(() => {});
  } else {
    await msgOrInter?.reply(reply).catch(() => {});
  }
};
