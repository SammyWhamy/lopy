import type { SlashCommand } from "discord.js";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { botConfig } from "../../config.js";

export const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("deploy")
        .setDescription("Deploy slash commands"),

    async execute(interaction) {
        if (interaction.user.id !== botConfig.owner) {
            const embed = new EmbedBuilder()
                .setTitle("❌ Error")
                .setDescription("YOU ARE NOT SAMMY!!! GET OUT BITCH")
                .setColor(0xED4245);

            await interaction.reply({ embeds: [embed] });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle("📨 Deploying...")
            .setColor(0x5865F2);

        await interaction.reply({ embeds: [embed] });

        await import("dotenv/config");
        await interaction.client.deployCommands();

        console.debug("Reloaded successfully");

        embed
            .setTitle("📦 Deployed!")
            .setColor(0x57F287);

        await interaction.editReply({ embeds: [embed] });
    },
};
