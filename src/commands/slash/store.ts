import type { SlashCommand } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { calculatePrice, getSkinRarity, rarityMap } from "../../riot/util.js";
import type { UUID } from "../../riot/ValorantApi.js";
import { ValorantApi } from "../../riot/ValorantApi.js";

export const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("store")
        .setDescription("Get the current VALORANT store")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("The user to get the store for"),
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

        const reply = await generateStore(api, id, api.accounts.selected!, interaction.user.id);
        await interaction.editReply(reply);
    },
};

export async function generateStore(api: ValorantApi, id: string, uuid: UUID, author: string) {
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
            .setDisabled(account.puuid === uuid)
            .setStyle(ButtonStyle.Secondary)
            .setCustomId(`store:${id}:${account.puuid}:${author}`);

        buttons.push(button);
    }

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);

    const store = await api.getStore(uuid);

    const offerPromises = store.SkinsPanelLayout.SingleItemStoreOffers.map((o: any) => fetch(`https://valorant-api.com/v1/weapons/skinlevels/${o.OfferID}`));
    const offersJsonPromises = (await Promise.all(offerPromises)).map(o => o.json());
    const offers = (await Promise.all(offersJsonPromises)).map(o => o.data);

    const embeds: EmbedBuilder[] = [];

    for (const o of offers) {
        const storeItem = store.SkinsPanelLayout.SingleItemStoreOffers.find((i: any) => i.OfferID === o.uuid);
        const rarity = (await getSkinRarity(o.uuid))!;
        const rarityStyle = rarityMap[rarity];
        const cost = storeItem!.Cost["85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741"];
        const usdPrice = calculatePrice(cost);

        const embed = new EmbedBuilder()
            .setTitle(`${rarityStyle.emoji} ${o.displayName}`)
            .setURL(o.displayIcon)
            .setDescription(`<:VP:1097600303580332202> ${cost} ($${usdPrice} USD)`)
            .setThumbnail(o.displayIcon)
            .setColor(rarityStyle.color);

        embeds.push(embed);
    }

    return {
        embeds,
        components: [row],
    };
}
