import type { Client, SlashCommand, TextCommand } from "discord.js";
import { readdir } from "fs/promises";
import { URL } from "url";

export async function loadTextCommands(this: Client): Promise<void> {
    this.textCommands.clear();

    const files = await readdir(new URL("../commands/text", import.meta.url)).catch(() => null);

    if (!files) {
        console.debug("[Command Loader] No text commands found");
        return;
    }

    const jsFiles = files.filter(f => f.endsWith(".js"));

    for (const file of jsFiles) {
        const command = (await import(`../commands/text/${file}?t=${Date.now()}`)).command as TextCommand;

        this.textCommands.set(command.name, command);
    }

    console.debug(`[Command Loader] Loaded ${this.textCommands.size} text commands`);
}

export async function loadSlashCommands(this: Client): Promise<void> {
    this.slashCommands.clear();

    const commands = await readSlashCommands();

    if (!commands) return;

    for (const command of commands) {
        this.slashCommands.set(command.data.name, command);
    }

    console.debug(`[Command Loader] Loaded ${this.slashCommands.size} slash commands`);
}

export async function readSlashCommands(): Promise<SlashCommand[] | null> {
    const files = await readdir(new URL("../commands/slash", import.meta.url)).catch(() => null);

    if (!files) {
        console.debug("[Command Loader] No slash commands found");
        return null;
    }

    const commands: SlashCommand[] = [];
    const jsFiles = files.filter(f => f.endsWith(".js"));

    for (const file of jsFiles) {
        const command = (await import(`../commands/slash/${file}?t=${Date.now()}`)).command as SlashCommand;

        commands.push(command);
    }

    return commands;
}
