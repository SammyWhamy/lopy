import type { Interaction } from "discord.js";
import { EmbedBuilder } from "discord.js";
import { generateStore } from "../commands/slash/store.js";
import type { UUID } from "../riot/ValorantApi.js";
import { ValorantApi } from "../riot/ValorantApi.js";

export async function interactionCreate(interaction: Interaction) {
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

    if (interaction.isButton()) {
        if (interaction.customId.startsWith("store:")) {
            const [_, id, uuid, author] = interaction.customId.split(":") as [string, string, UUID, string];

            if (interaction.user.id !== author) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Error")
                    .setDescription("This is not your button!")
                    .setColor(0xED4245);

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            const api = new ValorantApi();
            await api.getAccounts(id);

            const reply = await generateStore(api, id, uuid, author);
            await interaction.update(reply);
        }
    }
}
