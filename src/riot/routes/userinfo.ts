import type { UUID } from "../ValorantApi.js";

const USER_INFO_ROUTE = "https://auth.riotgames.com/userinfo";

export type UserInfo = {
    country: string;
    sub: UUID;
    email_verified: boolean;
    player_plocale?: unknown | null;
    country_at: number | null;
    pw: {
        cng_at: number;
        reset: boolean;
        must_reset: boolean;
    };
    phone_number_verified: boolean;
    account_verified: boolean;
    ppid?: unknown | null;
    federated_identity_providers: string[];
    player_locale: string | null;
    acct: {
        type: number;
        state: string;
        adm: boolean;
        game_name: string;
        tag_line: string;
        created_at: number;
    };
    age: number;
    jti: string;
    affinity: {
        [x: string]: string;
    };
};

export async function getUserInfo(token: string): Promise<UserInfo> {
    const response = await fetch(USER_INFO_ROUTE, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "User-Agent": "RiotClient/63.0.5.4887690.4789131 rso-auth (Windows; 10;;Professional, x64)",
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.status}`);
    }

    return await response.json();
}
