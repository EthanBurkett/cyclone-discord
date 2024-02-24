import PrefixModel from "@/models/Prefix.model";
import { Collection, Guild, type Client } from "discord.js";

declare module "discord.js" {
  interface Client {
    cache: Cache;
  }
}

interface GuildCache {
  prefix?: string;
  [key: string]: any;
}

export default class Cache extends Collection<string, GuildCache> {
  constructor() {
    super();

    this._database();
  }

  private async _database() {
    const prefixes = await PrefixModel.find({});

    for (const prefix of prefixes) {
      this.pushKey(prefix._id, "prefix", prefix.prefix);
    }
  }

  public pushKey(guild: string, key: string, value: any) {
    this.set(guild, {
      ...this.get(guild),
      [key]: value,
    });

    return this.get(guild);
  }
}
