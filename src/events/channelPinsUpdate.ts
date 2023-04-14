import type { TextBasedChannel } from "discord.js";
import { pinMessage } from "../services/pin.js";

export async function channelPinsUpdate(channel: TextBasedChannel) {
    const pinned = await channel.messages.fetchPinned(false);
    const pin = pinned.last();

    if (!pin) return;

    await pinMessage(pin);
}
