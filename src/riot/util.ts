import { getStoreOffers } from "./routes/store.js";

export type Rarity = "Select" | "Deluxe" | "Premium" | "Ultra" | "Exclusive";

export async function getSkinRarity(uuid: string): Promise<Rarity | undefined> {
    const offers = await getStoreOffers();
    const offer = offers.find((offer) => offer.offer_id === uuid);
    return offer?.content_tier.dev_name;
}

export const rarityMap: {
    [key in Rarity]: {
        color: number;
        emoji: string;
    }
} = {
    Select: {
        color: 0x5aa0e1,
        emoji: "<:Select:1097600465488838728>",
    },
    Deluxe: {
        color: 0x009985,
        emoji: "<:Deluxe:1097600582581227560>",
    },
    Premium: {
        color: 0xd1538c,
        emoji: "<:Premium:1097600467749572728>",
    },
    Ultra: {
        color: 0xf9d663,
        emoji: "<:Ultra:1097600583650775041>",
    },
    Exclusive: {
        color: 0xf99358,
        emoji: "<:Exclusive:1097600579884285992>",
    },
};

const prices = [
    [5, 475],
    [10, 1000],
    [20, 2050],
    [35, 3650],
    [50, 5350],
    [100, 11000],
];

export function calculatePrice(points: number): number {
    let usd = 0;

    for (let i = prices.length - 1; i >= 0; i--) {
        const [price, amount] = prices[i];
        const quotient = Math.floor(points / amount);
        if (quotient > 0) {
            usd += price * quotient;
            points -= amount * quotient;
        }
    }

    if (points > 0) {
        for (const [price, amount] of prices) {
            if (amount > points) {
                usd += price;
                break;
            }
        }
    }

    return usd;
}

