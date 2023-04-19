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
    colorChannel: "1040374622417338418",
    pins: {
        id: "1096245426300133437",
        channel: "1096226288416608306",
    },
};
