import type { Rarity } from "../util.js";
import type { UUID } from "../ValorantApi.js";

type Storefront = {
    FeaturedBundle: {
        Bundle: {
            ID: UUID;
            DataAssetID: UUID;
            CurrencyID: UUID;
            Items: {
                Item: {
                    ItemTypeID: UUID;
                    ItemID: UUID;
                    Quantity: number;
                };
                BasePrice: number;
                CurrencyID: UUID;
                DiscountPercent: number;
                DiscountedPrice: number;
                IsPromoItem: boolean;
            }[];
        };
        Bundles: {
            ID: UUID;
            DataAssetID: UUID;
            CurrencyID: UUID;
            Items: {
                Item: {
                    ItemTypeID: UUID;
                    ItemID: UUID;
                    Quantity: number;
                };
                BasePrice: number;
                CurrencyID: UUID;
                DiscountPercent: number;
                DiscountedPrice: number;
                IsPromoItem: boolean;
            }[];
        }[];
        BundleRemainingDurationInSeconds: number;
    };
    SkinsPanelLayout: {
        SingleItemOffers: string[];
        SingleItemStoreOffers: {
            OfferID: string;
            IsDirectPurchase: boolean;
            StartDate: string;
            Cost: {
                [x: string]: number;
            };
            Rewards: {
                ItemTypeID: UUID;
                ItemID: UUID;
                Quantity: number;
            }[];
        }[];
        SingleItemOffersRemainingDurationInSeconds: number;
    };
    UpgradeCurrencyStore: {
        UpgradeCurrencyOffers: {
            OfferID: UUID;
            StorefrontItemID: UUID;
            Offer: {
                OfferID: string;
                IsDirectPurchase: boolean;
                StartDate: string;
                Cost: {
                    [x: string]: number;
                };
                Rewards: {
                    ItemTypeID: UUID;
                    ItemID: UUID;
                    Quantity: number;
                }[];
            };
        }[];
    };
    BonusStore?: {
        BonusStoreOffers: {
            BonusOfferID: UUID;
            Offer: {
                OfferID: string;
                IsDirectPurchase: boolean;
                StartDate: string;
                Cost: {
                    [x: string]: number;
                };
                Rewards: {
                    ItemTypeID: UUID;
                    ItemID: UUID;
                    Quantity: number;
                }[];
            };
            DiscountPercent: number;
            DiscountCosts: {
                [x: string]: number;
            };
            IsSeen: boolean;
        };
    } | undefined;
};

export async function getStore(region: string, puuid: string, token: string, entitlements: string): Promise<Storefront> {
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
    data: [] as {
        offer_id: UUID,
        cost: number,
        name: string,
        icon: string,
        type: string,
        skin_id: UUID,
        content_tier: {
            name: string,
            dev_name: Rarity,
            icon: string,
        }
    }[],
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
