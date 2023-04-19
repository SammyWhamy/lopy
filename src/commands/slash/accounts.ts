import type { SlashCommand } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import type { UUID } from "../../riot/ValorantApi.js";
import { ValorantApi } from "../../riot/ValorantApi.js";

export const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("accounts")
        .setDescription("Select your default VALORANT account"),

    async execute(interaction) {
        await interaction.deferReply();

        const api = new ValorantApi();

        try {
            await api.auth(interaction.user.id);
        } catch (err: any) {
            if (err.message === "No account selected") {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Error")
                    .setDescription("You must login to your VALORANT account first")
                    .setColor(0xED4245);

                await interaction.editReply({ embeds: [embed] });
                return;
            }

            throw err;
        }

        const row = await generateAccountButtons(api, interaction.user.id);

        const embed = new EmbedBuilder()
            .setTitle("Select an account")
            .setDescription("Select an account to set as your default")
            .setColor(0x5865F2);

        await interaction.editReply({ embeds: [embed], components: [row] });
    },
};

export async function generateAccountButtons(api: ValorantApi, id: string): Promise<ActionRowBuilder<ButtonBuilder>> {
    await api.getAccounts(id);

    const buttons: ButtonBuilder[] = [];
    const accounts: UUID[] = [];

    for (const key in api.accounts) {
        if (key === "selected") continue;
        const account = api.accounts[key as UUID];
        accounts.push(account.puuid);
    }

    for (const puuid of accounts.sort()) {
        const account = api.accounts[puuid];

        const button = new ButtonBuilder()
            .setLabel(account.username)
            .setDisabled(account.puuid === api.accounts.selected)
            .setStyle(ButtonStyle.Secondary)
            .setCustomId(`account:${id}:${account.puuid}`);

        buttons.push(button);
    }

    return new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
}
