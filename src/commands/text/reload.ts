import { execSync } from "child_process";
import type { TextCommand } from "discord.js";
import { EmbedBuilder } from "discord.js";
import { botConfig } from "../../config.js";

export const command: TextCommand = {
    name: "reload",

    async execute(message, args) {
        if (message.author.id !== botConfig.owner) {
            const embed = new EmbedBuilder()
                .setTitle("❌ Error")
                .setDescription("YOU ARE NOT SAMMY!!! GET OUT BITCH")
                .setColor(0xED4245);

            await message.reply({ embeds: [embed] });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle("🔄 Reloading...")
            .setColor(0x5865F2);

        const reply = await message.reply({ embeds: [embed] });

        const build = args.includes("--build") || args.includes("-b")

        if (build) {
            embed
                .setTitle("🛠️ Building...")
                .setColor(0xFEE75C);

            await reply.edit({ embeds: [embed] });

            try {
                execSync("yarn build", {});
                console.debug("Recompiled successfully");
            } catch (error: any) {
                embed
                    .setTitle("❌ Error")
                    .setColor(0xED4245)
                    .setDescription(`Failed to recompile.\n\`\`\`${error.message.trim()}\`\`\``);

                await reply.edit({ embeds: [embed] });
                return;
            }
        }

        await message.client.loadTextCommands();
        await message.client.loadSlashCommands();
        await message.client.loadEvents();
        await import("dotenv/config");

        console.debug("Reloaded successfully");

        embed
            .setTitle("✅ Reloaded!")
            .setColor(0x57F287);

        await reply.edit({ embeds: [embed] });
    },
};
