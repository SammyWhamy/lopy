import { EmbedBuilder, Message } from "discord.js";
import { botConfig } from "../config.js";
import { Chatbot } from "../util/Chatbot.js";

const chatbot = new Chatbot();

export async function messageCreate(message: Message): Promise<void> {
    if (message.channelId === botConfig.colorChannel) {
        await message.delete();
        return;
    }

    if (message.author.bot)
        return;

    if (message.channelId === "1088314628179755078") {
        if (message.content.startsWith(".")) return;

        const response = await chatbot.chat(message.content);
        await message.reply({ content: response });

        return;
    }

    if (message.content.toLowerCase() === "hi") {
        await message.reply({ content: "Hello!!!" });
        return;
    }

    if (!message.content.startsWith(botConfig.prefix))
        return;

    const args = message.content.split(/ +/);

    if (args.length === 0)
        return;

    const trigger = args.shift()!.toLowerCase().slice(botConfig.prefix.length);
    const command = message.client.commands.get(trigger);

    if (!command) return;

    try {
        await command.execute(message, args);
    } catch (error: any) {
        const embed = new EmbedBuilder()
            .setTitle("❌ Error")
            .setDescription(error.message)
            .setColor(0xED4245);

        await message.reply({ embeds: [embed] });
    }
}