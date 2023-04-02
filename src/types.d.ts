import {
    AutocompleteInteraction,
    Awaitable,
    ChatInputCommandInteraction,
    Message,
    SlashCommandBuilder,
} from "discord.js";

declare module "discord.js" {
    export interface Client {
        textCommands: Map<string, TextCommand>;
        slashCommands: Map<string, SlashCommand>;
        loadEvents: () => Promise<void>;
        loadTextCommands: () => Promise<void>;
        loadSlashCommands: () => Promise<void>;
        deployCommands: () => Promise<void>;
    }

    export interface TextCommand {
        name: string;
        execute: (message: Message, args: string[]) => Promise<void>;
    }

    export interface SlashCommand {
        data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
        autocomplete?: (interaction: AutocompleteInteraction) => Awaitable<void>;
        execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
    }
}

declare global {
    interface Console {
        verbose(...data: any[]): void;
    }
}
