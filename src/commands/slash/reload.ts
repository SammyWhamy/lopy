import { execSync } from "child_process";
import type { SlashCommand } from "discord.js";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { botConfig } from "../../config.js";

export const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("reload")
        .setDescription("Reloads the bot")
        .addBooleanOption(option =>
            option
                .setName("build")
                .setDescription("Rebuilds the bot before reloading")
                .setRequired(false),
        ),

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
            .setTitle("🔄 Reloading...")
            .setColor(0x5865F2);

        await interaction.reply({ embeds: [embed] });

        const build = interaction.options.getBoolean("build", false);

        if (build) {
            embed
                .setTitle("🛠️ Building...")
                .setColor(0xFEE75C);

            await interaction.editReply({ embeds: [embed] });

            try {
                execSync("yarn build", {});
                console.debug("Recompiled successfully");
            } catch (error: any) {
                embed
                    .setTitle("❌ Error")
                    .setColor(0xED4245)
                    .setDescription(`Failed to recompile.\n\`\`\`${error.message.trim()}\`\`\``);

                await interaction.editReply({ embeds: [embed] });
                return;
            }
        }

        await interaction.client.loadTextCommands();
        await interaction.client.loadSlashCommands();
        await interaction.client.loadEvents();
        await import("dotenv/config");

        console.debug("Reloaded successfully");

        embed
            .setTitle("✅ Reloaded!")
            .setColor(0x57F287);

        await interaction.editReply({ embeds: [embed] });
    },
};
