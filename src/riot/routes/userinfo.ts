const USER_INFO_ROUTE = "https://auth.riotgames.com/userinfo";

export async function getUserInfo(token: string) {
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
