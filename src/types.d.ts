import { Message } from "discord.js";

declare module "discord.js" {
    export interface Client {
        commands: Map<string, Command>,
        loadEvents: () => Promise<void>,
        loadCommands: () => Promise<void>,
    }

    export interface Command {
        name: string;
        execute: (message: Message, args: string[]) => Promise<void>;
    }
}

declare global {
    interface Console {
        verbose(...data: any[]): void;
    }
}
