const AUTH_ROUTE = "https://auth.riotgames.com/api/v1/authorization";
const ENTITLEMENTS_ROUTE = "https://entitlements.auth.riotgames.com/api/token/v1";
const REAUTH_ROUTE = "https://auth.riotgames.com/authorize?redirect_uri=http%3A%2F%2Flocalhost%2Fredirect&client_id=riot-client&response_type=token%20id_token&nonce=1";

export async function postAuth() {
    const response = await fetch(AUTH_ROUTE, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "RiotClient/63.0.5.4887690.4789131 rso-auth (Windows; 10;;Professional, x64)",
        },
        body: JSON.stringify({
            client_id: "riot-client",
            nonce: "1",
            redirect_uri: "http://localhost/redirect",
            response_type: "token id_token",
            scope: "openid account",
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to get auth cookies: ${response.status}`);
    }

    const cookie = response.headers.get("set-cookie")?.match(/(asid=.*?);/)?.[1];

    if (!cookie) {
        throw new Error("Failed to get auth cookie");
    }

    return cookie;
}

export type AuthResponse = {
    mfa: {
        cookie: string,
        [x: string]: string,
    } | null,
    token: {
        token: string,
        ssid: string,
        expires: Date,
    } | null,
}

export async function putAuth(username: string, password: string, cookie: string): Promise<AuthResponse> {
    const response = await fetch(AUTH_ROUTE, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Cookie": cookie,
            "User-Agent": "RiotClient/63.0.5.4887690.4789131 rso-auth (Windows; 10;;Professional, x64)",
        },
        body: JSON.stringify({
            type: "auth",
            username,
            password,
            remember: true,
        }),
    });

    if (!response.ok) {
        const json = await response.json();
        throw new Error(`Failed to get auth token: ${response.status}\n${JSON.stringify(json, null, 2)}`);
    }

    const data = await response.json();

    if (data.type === "multifactor") {
        return {
            mfa: {
                cookie: response.headers.get("set-cookie")?.match(/(asid=.*?);/)?.[1],
                ...data.multifactor,
            },
            token: null,
        };
    }

    const token = data.response.parameters.uri.match(/access_token=(.*?)&/)?.[1];
    const ssid = response.headers.get("set-cookie")?.match(/(ssid=.*?);/)?.[1]!;

    return {
        mfa: null,
        token: {
            token,
            ssid,
            expires: new Date(Date.now() + 3600000),
        },
    };
}

export async function putAuthMfa(cookie: string, code: string) {
    const response = await fetch(AUTH_ROUTE, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Cookie": cookie,
            "User-Agent": "RiotClient/63.0.5.4887690.4789131 rso-auth (Windows; 10;;Professional, x64)",
        },
        body: JSON.stringify({
            type: "multifactor",
            code,
            rememberDevice: true,
        }),
    });

    if (!response.ok) {
        const json = await response.json();
        throw new Error(`Failed to get auth token: ${response.status}\n${JSON.stringify(json, null, 2)}`);
    }

    const data = await response.json();

    if (data.error) {
        throw new Error(data.error);
    }

    const token = data.response.parameters.uri.match(/access_token=(.*?)&/)?.[1] as string;
    const ssid = response.headers.get("set-cookie")?.match(/(ssid=.*?);/)?.[1]!;

    return {
        token,
        ssid,
        expires: new Date(Date.now() + 3600000),
    };
}

export async function getAuth(ssid: string) {
    const response = await fetch(REAUTH_ROUTE, {
        headers: {
            "Cookie": ssid,
        },
        redirect: "manual",
    });

    if (response.status !== 303) {
        throw new Error(`Failed to get auth token: ${response.status}`);
    }

    const data = await response.text();

    const token = data.match(/access_token=(.*?)&/)?.[1]!;

    return {
        token,
        ssid,
        expires: new Date(Date.now() + 3600000),
    };
}

export async function postEntitlement(token: string): Promise<string> {
    const response = await fetch(ENTITLEMENTS_ROUTE, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "User-Agent": "RiotClient/63.0.5.4887690.4789131 rso-auth (Windows; 10;;Professional, x64)",
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to get entitlement token: ${response.status}`);
    }

    const data = await response.json();

    return data.entitlements_token;
}
