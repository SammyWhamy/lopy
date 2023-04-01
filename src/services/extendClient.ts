import type { Awaitable, Command } from "discord.js";
import { Client } from "discord.js";
import { readdir } from "fs/promises";
import { URL } from "url";

const eventsCache: Map<string, (...args: any[]) => Awaitable<void>> = new Map();

async function loadCommands(this: Client): Promise<void> {
    this.commands.clear();

    const files = await readdir(new URL("../commands", import.meta.url));
    const jsFiles = files.filter(f => f.endsWith(".js"));

    for (const file of jsFiles) {
        const command = (await import(`../commands/${file}?t=${Date.now()}`)).command as Command;

        this.commands.set(command.name, command);
    }
}

async function loadEvents(this: Client) {
    const files = await readdir(new URL("../events", import.meta.url));
    const jsFiles = files.filter(f => f.endsWith(".js"));

    for (const [eventName, event] of eventsCache) {
        this.off(eventName, event);
    }

    eventsCache.clear();

    for (const file of jsFiles) {
        const eventName = file.split(".")[0];
        const event = (await import(`../events/${file}?t=${Date.now()}`))[eventName];
        this.on(eventName, event);

        eventsCache.set(eventName, event);
    }
}

Client.prototype.loadCommands = loadCommands;
Client.prototype.loadEvents = loadEvents;
Client.prototype.commands = new Map();
