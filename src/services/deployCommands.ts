import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import "dotenv/config";
import "../services/extendConsole.js";
import { readSlashCommands } from "./loadCommands.js";

export async function deployCommands() {
    if (!process.env.TOKEN) throw new Error("No token provided");
    if (!process.env.APPLICATION_ID) throw new Error("No application ID provided");

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN as string);

    const commands = await readSlashCommands();

    if (!commands) {
        console.warn("No commands found");
        return;
    }

    const commandData = commands.map(c => c.data.toJSON());

    const response = await rest.put(Routes.applicationCommands(process.env.APPLICATION_ID!), { body: commandData });

    console.log(`Response:\n${JSON.stringify(response, null, 2)}`);
    console.log(`Successfully registered ${commandData.length} slash commands.`);
}
