import type { CommandCallback, Command, CommandType } from "@types";
import type {
  ApplicationCommandOptionData,
  PermissionsString,
} from "discord.js";

export class BaseCommand<TCommandType extends CommandType> {
  private _description: string;
  private _callback: CommandCallback<TCommandType>;
  private _guilds: string[] | undefined;

  constructor(options: Command<false, TCommandType>) {
    this._name = options.name;
    this._description = options.description;
    this._callback = options.callback;
    this._guilds = options.guilds;
    this._options = options.options;
  }

  public get callback() {
    return this._callback;
  }

  private _name: string;

  public get name() {
    return this._name;
  }

  public get description() {
    return this._description;
  }

  private _options?: ApplicationCommandOptionData[];

  public get options() {
    return this._options;
  }

  public _permission?: PermissionsString;

  public get permission() {
    return this._permission;
  }

  public get guilds() {
    return this._guilds;
  }
}
