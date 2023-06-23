import type { ClientOptions } from "discord.js";
import { IntentsBitField } from "discord.js";

export const clientConfig: ClientOptions = {
    rest: {
        api: `${process.env.API_PROXY_ADDR}/api`,
    },
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
    allowedMentions: {
        parse: ["users", "roles"],
        repliedUser: true,
    },
};

export const botConfig = {
    prefix: "!",
    owner: "560821786011369472",
    colorChannel: "1121637602580238426",
    pins: {
        id: "1121916155897065492",
        channel: "1121915442794082344",
    },
};
