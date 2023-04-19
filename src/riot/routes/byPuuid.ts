import type { UUID } from "../ValorantApi.js";

export type AccountData = {
    puuid: UUID,
    region: string,
    account_level: number,
    name: string,
    tag: string,
    card: {
        small: string,
        large: string,
        wide: string,
        id: UUID,
    },
    last_update: string,
    last_update_raw: number
}

export async function byPuuid(puuid: string): Promise<AccountData> {
    if (!process.env.HENRIK_TOKEN) {
        throw new Error("Henrik token not found");
    }

    const response = await fetch(`https://api.henrikdev.xyz/valorant/v1/by-puuid/account/${puuid}`, {
        headers: {
            "Authorization": process.env.HENRIK_TOKEN,
        },
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(`Failed to get account data: ${response.status}\n${JSON.stringify(data, null, 2)}`);
    }

    return (await response.json()).data;
}
