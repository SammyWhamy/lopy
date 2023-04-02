import type { TextCommand } from "discord.js";
import { EmbedBuilder } from "discord.js";
import { BirthdayModel } from "../../models/Birthday.js";

export const command: TextCommand = {
    name: "birthdays",

    async execute(message) {
        const birthdays = await BirthdayModel.find().sort({ date: 1 });

        if (birthdays.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle("❌ Error")
                .setDescription("No birthdays have been set")
                .setColor(0xED4245);

            await message.reply({ embeds: [embed] });
        }

        let description = "";

        for (const birthday of birthdays) {
            const timestamp = Math.round(birthday.date.getTime() / 1000);
            description += `<@${birthday.user}>\n<t:${timestamp}:R> (<t:${timestamp}:d>)\n\n`;
        }

        const embed = new EmbedBuilder()
            .setTitle("🎂 Birthdays")
            .setDescription(description)
            .setColor(0xEB459E);

        await message.reply({ embeds: [embed] });
    },
};
