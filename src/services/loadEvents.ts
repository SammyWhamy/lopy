import type { Awaitable, Client } from "discord.js";
import { readdir } from "fs/promises";
import { URL } from "url";

const eventsCache: Map<string, (...args: any[]) => Awaitable<void>> = new Map();

export async function loadEvents(this: Client) {
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
