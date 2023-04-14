import type { TextCommand } from "discord.js";
import { EmbedBuilder } from "discord.js";
import { botConfig } from "../../config.js";

export const command: TextCommand = {
    name: "deploy",

    async execute(message) {
        if (message.author.id !== botConfig.owner) {
            const embed = new EmbedBuilder()
                .setTitle("❌ Error")
                .setDescription("YOU ARE NOT SAMMY!!! GET OUT BITCH")
                .setColor(0xED4245);

            await message.reply({ embeds: [embed] });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle("📨 Deploying...")
            .setColor(0x5865F2);

        const reply = await message.reply({ embeds: [embed] });

        await import("dotenv/config");
        await message.client.deployCommands();

        console.debug("Reloaded successfully");

        embed
            .setTitle("📦 Deployed!")
            .setColor(0x57F287);

        await reply.edit({ embeds: [embed] });
    },
};
