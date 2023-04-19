import type { ColorResolvable, SlashCommand } from "discord.js";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { getAverageColor } from "fast-average-color-node";
import { byPuuid } from "../../riot/routes/byPuuid.js";
import { ValorantApi } from "../../riot/ValorantApi.js";

export const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("party")
        .setDescription("Get the current VALORANT party")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("The user to get the party for"),
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const id = interaction.options.getUser("user")?.id ?? interaction.user.id;

        const api = new ValorantApi();

        try {
            await api.auth(id);
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

        await api.getAccounts(id);
        const party = await api.getParty();

        const embeds: EmbedBuilder[] = [];

        for (const member of party.Members) {
            const accountData = await byPuuid(member.Subject);

            const cardImage = await fetch(accountData.card.small);
            const cardBuffer = Buffer.from(await cardImage.arrayBuffer());
            const color = await getAverageColor(cardBuffer);

            const embed = new EmbedBuilder()
                .setTitle(`${accountData.name}#${accountData.tag}`)
                .setDescription(`${member.IsOwner ? `**Party leader**\n` : ""}**Level:** ${accountData.account_level}`)
                .setThumbnail(accountData.card.small)
                .setColor(color.hex as ColorResolvable);

            embeds.push(embed);
        }

        await interaction.editReply({ embeds });
    },
};
