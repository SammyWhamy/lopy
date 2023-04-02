import type { Interaction } from "discord.js";
import { EmbedBuilder } from "discord.js";

export async function interactionCreate(interaction: Interaction): Promise<void> {
    if (interaction.isChatInputCommand()) {
        const command = interaction.client.slashCommands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error: any) {
            console.error(error);

            const embed = new EmbedBuilder()
                .setTitle("❌ Error")
                .setDescription(`An error occurred while executing this command.\n\`\`\`${error.message}\`\`\``)
                .setColor(0xED4245);

            if (interaction.replied || interaction.deferred)
                await interaction.editReply({ embeds: [embed] });
            else
                await interaction.reply({ embeds: [embed] });
        }

        return;
    }

    if (interaction.isAutocomplete()) {
        const command = interaction.client.slashCommands.get(interaction.commandName);

        if (!command?.autocomplete) {
            console.error(`Autocomplete for ${interaction.commandName} is not implemented`);
            return;
        }

        await command.autocomplete(interaction);

        return;
    }
}
