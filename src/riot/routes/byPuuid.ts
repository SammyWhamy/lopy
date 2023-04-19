export async function byPuuid(puuid: string) {
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
