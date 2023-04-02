import type { SlashCommand } from "discord.js";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { BirthdayModel } from "../../models/Birthday.js";

export const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("set-birthday")
        .setDescription("Set your birthday")
        .addNumberOption(option =>
            option
                .setName("month")
                .setRequired(true)
                .setDescription("The month of your birthday"),
        )
        .addNumberOption(option =>
            option
                .setName("day")
                .setRequired(true)
                .setDescription("The day of your birthday"),
        )
        .addStringOption(option =>
            option
                .setName("timezone")
                .setRequired(true)
                .setDescription("The year of your birthday")
                .setAutocomplete(true),
        ),

    async autocomplete(interaction) {
        const focused = interaction.options.getFocused();

        const timezonesResponse = await fetch("https://worldtimeapi.org/api/timezone");

        if (!timezonesResponse.ok) {
            console.error("Failed to fetch timezones");
            return;
        }

        const timezones: string[] = await timezonesResponse.json();

        const timezonesFiltered = timezones.filter(timezone => timezone.toLowerCase().includes(focused.toLowerCase()));
        const choices = timezonesFiltered.map(timezone => ({ name: timezone, value: timezone }));

        await interaction.respond(choices.slice(0, 25));
    },

    async execute(interaction) {
        await interaction.deferReply();

        const month = interaction.options.getNumber("month", true).toString().padStart(2, "0");
        const day = interaction.options.getNumber("day", true).toString().padStart(2, "0");
        const timezone = interaction.options.getString("timezone", true);
        const timezoneDataResponse = await fetch(`https://worldtimeapi.org/api/timezone/${timezone}`);

        if (!timezoneDataResponse.ok) {
            const embed = new EmbedBuilder()
                .setTitle("❌ Error")
                .setDescription("Invalid timezone")
                .setColor(0xED4245);

            await interaction.reply({ embeds: [embed] });
            return;
        }

        const timezoneData = await timezoneDataResponse.json();

        let birthdayInDst = false;

        if (timezoneData.dst) {
            const dstStartTuple = [
                parseInt(timezoneData.dst_from.split("-")[1]).toString().padStart(2, "0"),
                parseInt(timezoneData.dst_from.split("-")[2]).toString().padStart(2, "0"),
            ];
            const dstStart = parseInt(`${dstStartTuple[0]}${dstStartTuple[1]}`);

            const dstEndTuple = [
                parseInt(timezoneData.dst_until.split("-")[1]).toString().padStart(2, "0"),
                parseInt(timezoneData.dst_until.split("-")[2]).toString().padStart(2, "0"),
            ];
            const dstEnd = parseInt(`${dstEndTuple[0]}${dstEndTuple[1]}`);

            birthdayInDst = parseInt(`${month}${day}`) >= dstStart && parseInt(`${month}${day}`) <= dstEnd;
        }

        const nowInDst = timezoneData.dst;

        const minutes = timezoneData.dst_offset % 3600 / 60;
        const hours = (timezoneData.dst_offset - minutes) / 3600;

        const utcOffsetHours = parseInt(timezoneData.utc_offset.split(":")[0]);
        const utcOffsetMinutes = parseInt(timezoneData.utc_offset.split(":")[1]);

        if (!birthdayInDst && nowInDst) {
            let new_hours: number | string = (utcOffsetHours - hours);

            if (new_hours < 0) {
                new_hours = new_hours.toString().replace("-", "").padStart(2, "0");
                new_hours = `-${new_hours}`;
            } else {
                new_hours = new_hours.toString().padStart(2, "0");
                new_hours = `+${new_hours}`;
            }

            timezoneData.utc_offset = `${new_hours}:${(utcOffsetMinutes - minutes).toString().padStart(2, "0")}`;
        }

        if (birthdayInDst && !nowInDst) {
            let new_hours: number | string = (utcOffsetHours + hours);

            if (new_hours < 0) {
                new_hours = new_hours.toString().replace("-", "").padStart(2, "0");
                new_hours = `-${new_hours}`;
            } else {
                new_hours = new_hours.toString().padStart(2, "0");
                new_hours = `+${new_hours}`;
            }

            timezoneData.utc_offset = `${new_hours}:${(utcOffsetMinutes + minutes).toString().padStart(2, "0")}`;
        }

        const dateString = `${new Date().getUTCFullYear()}-${month}-${day}T00:00:00${timezoneData.utc_offset}`;
        const date = new Date(dateString);

        if (date.getTime() < Date.now()) {
            date.setUTCFullYear(date.getUTCFullYear() + 1);
        }

        await BirthdayModel.findOneAndUpdate({
            user: interaction.user.id,
        }, {
            user: interaction.user.id,
            date: date,
        }, {
            upsert: true,
        }).exec();

        const timestamp = `<t:${Math.round(date.getTime() / 1000)}:R>`;
        await interaction.editReply(`**Saved!**\nYour birthday is ${timestamp}!`);
    },
};
