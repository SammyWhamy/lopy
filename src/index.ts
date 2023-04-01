import { Client } from "discord.js";
import "dotenv/config";
import { clientConfig } from "./config.js";
import "./services/extendClient.js";
import "./services/extendConsole.js";

process.on("unhandledRejection", (reason, promise) => {
    console.error(`Unhandled promise rejection: ${reason}`);
    console.error(promise);
});

const client = new Client(clientConfig);

await client.loadEvents();
await client.loadCommands();
await client.login(process.env.TOKEN);
