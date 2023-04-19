export async function getStore(region: string, puuid: string, token: string, entitlements: string) {
    const response = await fetch(`https://pd.${region}.a.pvp.net/store/v2/storefront/${puuid}`, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "X-Riot-Entitlements-JWT": entitlements,
        },
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(`Failed to get store: ${response.status}\n${JSON.stringify(data, null, 2)}`);
    }

    return await response.json();
}

let storeOffersCache = {
    data: [] as any[],
    expires: new Date(0),
};

export async function getStoreOffers() {
    if (storeOffersCache.expires < new Date()) {
        storeOffersCache.data = [];
    }

    if (storeOffersCache.data.length > 0) {
        return storeOffersCache.data;
    }

    if (!process.env.HENRIK_TOKEN) {
        throw new Error("Henrik token not found");
    }

    const response = await fetch(`https://api.henrikdev.xyz/valorant/v2/store-offers`, {
        headers: {
            "Authorization": process.env.HENRIK_TOKEN,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to get store offers: ${response.status}`);
    }

    const data = await response.json();

    storeOffersCache.data = data.data.offers;
    storeOffersCache.expires = new Date(Date.now() + 3600000);

    return storeOffersCache.data;
}
