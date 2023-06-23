import type { TextCommand } from "discord.js";
import { EmbedBuilder } from "discord.js";
import * as util from "util";
import { botConfig } from "../../config.js";

export const command: TextCommand = {
    name: "eval",

    async execute(message, args) {
        if (message.author.id !== botConfig.owner) {
            const embed = new EmbedBuilder()
                .setTitle("❌ Error")
                .setDescription("YOU ARE NOT SAMMY!!! GET OUT BITCH")
                .setColor(0xED4245);

            await message.reply({ embeds: [embed] });
            return;
        }

        let async = false;
        if (args[0] === "--async") {
            async = true;
            args.shift();
        }

        const input = args.join(" ");
        let toEval = input.startsWith("```") ? input.slice(5, -3).trim() : input.trim();
        try {
            let evaled;
            if (async) {
                evaled = await eval(`(async () => {
                    ${toEval}
                })();`);
            } else {
                evaled = eval(toEval);
            }
            if (typeof evaled !== "string") {
                evaled = util.inspect(evaled);
            }
            if (evaled) {
                if (evaled === "noop") return;
                const embed = new EmbedBuilder()
                    .setColor(0x57F287)
                    .setTitle("Eval results:")
                    .addFields(
                        { name: "Input:", value: `\`\`\`ts\n${toEval}\`\`\`` },
                        { name: "Output:", value: `\`\`\`js\n${evaled}\`\`\`` },
                    );
                await message.channel.send({ embeds: [embed] }).catch(() => {
                });
            } else {
                const embed = new EmbedBuilder()
                    .setColor(0xED4245)
                    .setTitle("Code could not be evaled.")
                    .addFields({ name: "Input:", value: `\`\`\`ts\n${toEval}\`\`\`` });
                await message.channel.send({ embeds: [embed] }).catch(() => {
                });
            }
        } catch (err: any) {
            console.warn(err.message);
            console.warn(err);
            const errEmbed = new EmbedBuilder()
                .setColor(0xED4245)
                .setTitle("Error occurred while running code:")
                .addFields(
                    { name: "Input", value: `\`\`\`ts\n${toEval}\`\`\`` },
                    { name: "Error:", value: `\`\`\`xl\n${err.message}\n\`\`\`` },
                );
            await message.channel.send({ embeds: [errEmbed] }).catch(() => {
            });
        }
    },
};
