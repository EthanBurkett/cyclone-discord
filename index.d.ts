import type { SlashCommand } from "@/Classes/SlashCommand.ts";
import type { MessageCommand } from "@/Classes/MessageCommand.ts";
import type { BothCommand } from "@/Classes/BothCommand.ts";
import type {
  ApplicationCommandOptionData,
  CacheType,
  CommandInteraction,
  Message,
  MessagePayloadOption,
  PermissionsString,
} from "discord.js";

export type CommandType = "SLASH" | "MESSAGE" | "BOTH";

type CmdOptions = {
  name: string;
  description: string;
  guilds?: string[];
  options?: ApplicationCommandOptionData[];
  permission?: PermissionsString;
};

export type CommandOptions<TRequireType extends boolean> =
  TRequireType extends true
    ? {
        [key in keyof CmdOptions]: CmdOptions[key];
      } & { type: CommandType }
    : {
        [key in keyof CmdOptions]: CmdOptions[key];
      };

export type CallbackContext<TCommandType extends CommandType = "BOTH"> =
  TCommandType extends "BOTH"
    ? {
        message?: Message<boolean>;
        interaction?: CommandInteraction<CacheType>;
      }
    : TCommandType extends "SLASH"
    ? {
        interaction: CommandInteraction<CacheType>;
      }
    : {
        message: Message<boolean>;
      };

export type CommandCallback<TCommandType extends CommandType> = (
  context: CallbackContext<TCommandType>
) => string | void | EmbedBuilder | MessagePayloadOption;

export type Command<
  TRequireType extends boolean = true,
  TCommandType extends CommandType = "BOTH"
> = CommandOptions<TRequireType> & {
  callback: CommandCallback<TCommandType>;
};

export type ValidCommand = SlashCommand | MessageCommand | BothCommand;
