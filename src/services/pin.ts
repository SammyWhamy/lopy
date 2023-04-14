import type { APIEmbed, Message } from "discord.js";
import { Embed, WebhookClient } from "discord.js";
import { botConfig } from "../config.js";

export async function pinMessage(message: Message) {
    if (!process.env.PINS_WEBHOOK_TOKEN) {
        console.error("Pins webhook not found");
        return;
    }

    const pinsWebhook = new WebhookClient({ id: botConfig.pins.id, token: process.env.PINS_WEBHOOK_TOKEN });

    await pinsWebhook.send({
        avatarURL: message.member?.displayAvatarURL() || message.author.displayAvatarURL(),
        username: message.author.username,
        files: message.attachments.toJSON(),
        content: message.content.length > 2000 ? message.content.slice(0, 1997) + "..." : message.content,
        embeds: message.embeds.map(e => embedTransformer(e)).filter(e => e !== null) as APIEmbed[],
        components: [{
            type: 1,
            components: [{
                type: 2 ,
                label: "Original message",
                style: 5,
                url: message.url,
            }]
        }],
    });

    await message.unpin("Moved to starboard");
}

function embedTransformer(embed: Embed): APIEmbed | null {
    if (embed.url?.includes("https://tenor.com/") || embed.url?.endsWith(".gif")) return null;
    return embed.toJSON();
}
