import type { SlashCommand } from "discord.js";
import {
    ActionRowBuilder,
    EmbedBuilder,
    ModalBuilder,
    SlashCommandBuilder,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";
import type { Account } from "../../riot/ValorantApi.js";
import { ValorantApi } from "../../riot/ValorantApi.js";

export const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("login")
        .setDescription("Login to your VALORANT account")
        .addStringOption(option =>
            option
                .setName("username")
                .setRequired(true)
                .setDescription("Your VALORANT username"),
        )
        .addStringOption(option =>
            option
                .setName("password")
                .setRequired(true)
                .setDescription("Your VALORANT password"),
        ),
    async execute(interaction) {
        const username = interaction.options.getString("username", true);
        const password = interaction.options.getString("password", true);

        const api = new ValorantApi();

        const uid = Math.random().toString(36).substring(2, 16);

        api.on(`mfa:${uid}`, async (mfa) => {
            if (!mfa) {
                await interaction.deferReply({ ephemeral: true });
                return;
            }

            const modal = new ModalBuilder()
                .setCustomId(`mfa:${uid}`)
                .setTitle("🔐 MFA Required")
                .addComponents(
                    new ActionRowBuilder<TextInputBuilder>()
                        .addComponents(new TextInputBuilder()
                            .setCustomId("mfa")
                            .setLabel("Enter your MFA code")
                            .setMinLength(mfa.multiFactorCodeLength)
                            .setMaxLength(mfa.multiFactorCodeLength)
                            .setStyle(TextInputStyle.Short)),
                );

            await interaction.showModal(modal);

            const submission = await interaction.awaitModalSubmit({
                filter: i => i.customId === `mfa:${uid}`,
                time: 300000,
            }).catch(() => null);

            if (!submission) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Error")
                    .setDescription("You took too long to enter your MFA code")
                    .setColor(0xED4245);

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            interaction = submission as any;

            await interaction.deferReply({ ephemeral: true });

            api.emit(`mfa:${uid}:code`, submission.fields.getTextInputValue("mfa"));
        });

        let account: Account;
        try {
            account = await api.login(interaction.user.id, username, password, uid);
        } catch (err: any) {
            if (err.message === "MFA code not provided") {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Error")
                    .setDescription("You took too long to enter your MFA code")
                    .setColor(0xED4245);

                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            console.error(err);

            const embed = new EmbedBuilder()
                .setTitle("❌ Error")
                .setDescription(`An error occurred while executing this command.\n\`\`\`${err.message}\`\`\``)
                .setColor(0xED4245);

            await interaction.editReply({ embeds: [embed] });

            return;
        }

        const embed = new EmbedBuilder()
            .setTitle("📨 Login successful!")
            .setDescription(`Logged in as **${account.username}**`)
            .setColor(0x57F287);

        await interaction.editReply({ embeds: [embed] });
    },
};
