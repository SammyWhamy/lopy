import { Client } from "discord.js";

export async function ready(client: Client) {
    console.info(`Ready! Logged in as ${client.user!.tag}`);
}
