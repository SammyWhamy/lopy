import { Client } from "discord.js";
import "dotenv/config";
import { scheduleJob } from "node-schedule";
import { clientConfig } from "./config.js";
import { connectMongo } from "./services/connectMongo.js";
import { correctBirthdays } from "./services/correctBirthdays.js";
import "./services/extendClient.js";
import "./services/extendConsole.js";

process.on("unhandledRejection", (reason, promise) => {
    console.error(`Unhandled promise rejection: ${reason}`);
    console.error(promise);
});

const client = new Client(clientConfig);

await connectMongo();

scheduleJob("correctBirthdays", "0 0 * * * *", correctBirthdays);

await client.loadEvents();
await client.loadTextCommands();
await client.loadSlashCommands();
await client.login(process.env.TOKEN);
