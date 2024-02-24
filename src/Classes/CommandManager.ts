import {
  ApplicationCommand,
  Collection,
  type ApplicationCommandData,
  type ApplicationCommandOption,
  type ApplicationCommandOptionData,
} from "discord.js";
import { SlashCommand } from "@/Classes/SlashCommand.ts";
import fs from "fs";
import type { CallbackContext, CommandType, ValidCommand } from "@types";
import path from "path";
import { BothCommand } from "@/Classes/BothCommand.ts";
import { MessageCommand } from "@/Classes/MessageCommand.ts";
import { client } from "@/index";
import equal from "deep-equal";

export class CommandManager {
  private _dir: string;

  constructor(dir: string = "src/Commands") {
    this._commands = new Collection<string, ValidCommand>();
    this._dir = dir;
    this._findCommands();
  }

  private _commands: Collection<string, ValidCommand>;

  public get commands() {
    return this._commands;
  }

  public async publish<TCommandType extends CommandType = "BOTH">(
    commandName: string,
    {
      // @ts-ignore - ignore these 2 because either one will always be defined, checked within code below
      message,
      // @ts-ignore
      interaction,
    }: CallbackContext<TCommandType>
  ) {
    const command = this._commands.get(commandName);
    if (!command) return;
    console.log("publish cb");
    if (command instanceof BothCommand)
      return await command.execute(message, interaction);
    if (command instanceof MessageCommand)
      return await command.execute(message);
    if (command instanceof SlashCommand)
      return await command.execute(interaction);
  }

  private async _findCommands(extend?: string) {
    const files = fs.readdirSync(`${this._dir}${extend ?? ""}`, {
      withFileTypes: true,
    });
    let validFiles: ValidCommand[] = [];

    for (const file of files) {
      if (file.isDirectory()) {
        await this._findCommands(file.name);
        return;
      }

      let imported = await import(path.join(this._dir, file.name));
      if (imported.default) imported = imported.default;

      if (
        imported instanceof SlashCommand ||
        imported instanceof MessageCommand ||
        imported instanceof BothCommand
      ) {
        validFiles.push(imported);
      } else {
        continue;
      }

      this._commands.set(imported.name, imported);
      if (imported instanceof SlashCommand || imported instanceof BothCommand) {
        this._create(imported);
      }
    }

    await this._slashCommandChecks(this._commands);
  }

  private async _slashCommandChecks(cmds: Collection<string, ValidCommand>) {
    const commands = cmds.filter(
      (c) => c instanceof SlashCommand || c instanceof BothCommand
    );

    const clientCommands = await client.application?.commands
      .fetch()
      .then((c) => c);

    // find commands that are in the client but not in the command manager
    const commandsToDelete = clientCommands?.filter(
      (c) => !commands.find((f) => f.name == c.name)
    );
    commandsToDelete?.map(async (c) => {
      await c
        .delete()
        .then(() => {
          client.log(
            `Deleted command ${c.name} due to it not being in the command manager anymore.`
          );
        })
        .catch((e) => {
          client.error(e);
          client.error("Could not delete command " + c.name);
        });
    });

    // find commands that are in the command manager but not in the client
    const commandsToCreate = commands.filter(
      (c) => !clientCommands?.find((f) => f.name == c.name)
    );
    commandsToCreate.map(async (c) => {
      await this._create(c);
    });

    // check client commands and update options if changed
    for (const [name, command] of commands) {
      const clientCommand = clientCommands?.find((c) => c.name == name);
      if (!clientCommand) continue;
      if (equal(command.options, clientCommand.options)) continue;

      await client.application?.commands
        .edit(clientCommand.id, {
          options: command.options,
        })
        .then(() => {
          client.log(`Updated command ${name} due to options being changed.`);
        })
        .catch((e) => {
          client.error(e);
          client.error("Could not update command " + name);
        });
    }

    const guildCommands = this._commands.filter(
      (c) => c instanceof SlashCommand || c instanceof BothCommand
    );

    for (const [name, command] of guildCommands) {
      if (!guildCommands) {
        await this._create(command);
        continue;
      }
      if (!command.guilds) continue;
      for (const guildId of command.guilds) {
        const guild = await client.guilds.cache.get(guildId);
        const fetchedCommands = await guild?.commands.fetch().then((c) => c);

        // find commands that are in the client but not in the command manager
        const commandsToDelete = fetchedCommands?.filter(
          (c) => !guildCommands.find((f) => f.name == c.name)
        );
        commandsToDelete?.map(async (c) => {
          await c
            .delete()
            .then(() => {
              client.log(
                `Deleted command ${c.name} due to it not being in the command manager anymore.`
              );
            })
            .catch((e) => {
              client.error(e);
              client.error("Could not delete command " + c.name);
            });
        });
      }
    }

    // check guild commands and update options if changed
    for (const [name, command] of guildCommands) {
      if (!command.guilds) continue;
      for (const guildId of command.guilds) {
        const guild = await client.guilds.cache.get(guildId);
        const fetchedCommands = await guild?.commands.fetch().then((c) => c);

        const clientCommand = fetchedCommands?.find((c) => c.name == name);
        if (!clientCommand) continue;
        if (this.didOptionsChange(command, clientCommand.options) === false)
          continue;

        await guild?.commands
          .edit(clientCommand.id, {
            options: command.options,
          })
          .then(() => {
            client.log(`Updated command ${name} due to options being changed.`);
          })
          .catch((e) => {
            client.error(e);
            client.error("Could not update command " + name);
          });
      }
    }
  }

  private didOptionsChange(
    command: ValidCommand,
    options: ApplicationCommandOptionData[] | any
  ): boolean {
    return (
      command.options?.filter((opt: any, index: any) => {
        return (
          opt?.required !== options[index]?.required &&
          opt?.name !== options[index]?.name &&
          opt?.options?.length !== options.length
        );
      }).length !== 0
    );
  }

  private async _create(command: ValidCommand) {
    if (command instanceof MessageCommand) return;

    if (command.guilds && command.guilds.length > 0) {
      const { guilds } = command;
      guilds.map(async (g) => {
        const guild = await client.guilds
          .fetch(g)
          .then((g) => g)
          .catch(() => {
            throw new Error("Could not fetch guild " + g);
          });

        const commandExists = await (
          await guild.commands.fetch()
        ).find((f) => f.name == command.name);
        if (commandExists) {
          return;
        }

        await client.application?.commands
          .create(
            {
              name: command.name,
              description: command.description,
              options: command.options,
            },
            g
          )
          .then(() => {
            client.log(`Created command ${command.name} for guild ${g}`);
          })
          .catch((e) => {
            client.error(e);
            client.error("Could not create guild command " + command.name);
          });
      });
      return;
    } else {
      const commands = await client.application?.commands
        .fetch()
        .then((c) => c);
      const commandExists = commands?.find((f) => f.name == command.name);
      if (commandExists) {
        return;
      }

      return client.application?.commands
        .create({
          name: command.name,
          description: command.description,
          options: command.options,
        })
        .then(() => {
          client.log(`Created command ${command.name}`);
        })
        .catch((e) => {
          client.error(e);
          client.error("Could not create command " + command.name);
        });
    }
  }
}
