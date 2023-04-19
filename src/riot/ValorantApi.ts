import { EventEmitter } from "events";
import { Redis } from "ioredis";
import { getAuth, postAuth, postEntitlement, putAuth, putAuthMfa } from "./routes/authorization.js";
import { byPuuid } from "./routes/byPuuid.js";
import { getStore } from "./routes/store.js";
import { getUserInfo } from "./routes/userinfo.js";

const redis = new Redis({ port: 6380 });

export type UUID = `${string}-${string}-${string}-${string}-${string}`;

export type Token = {
    token: string,
    ssid: string,
    expires: Date,
}

export type Account = {
    token: Token,
    region: string,
    puuid: UUID,
    entitlements: string,
    username: string,
}

type Accounts = {
    selected: UUID | null,
    [key: UUID]: Account
}

export class ValorantApi extends EventEmitter {
    accounts: Accounts = {
        selected: null,
    };

    private cookie: string | null = null;

    private getAccount(uuid: UUID | null = null) {
        if (uuid) return this.accounts[uuid];
        else {
            if (!this.accounts.selected) throw new Error("No account selected");
            return this.accounts[this.accounts.selected];
        }
    }

    private async getAuthCookies() {
        this.cookie = await postAuth();
    };

    private async reAuth(uuid: UUID | null = null) {
        const account = this.getAccount(uuid);

        if (!account.token?.ssid) {
            throw new Error("Not logged in");
        }

        account.token = await getAuth(account.token.ssid);
        account.entitlements = await postEntitlement(account.token.token);
    }

    async login(id: string, username: string, password: string, uid: string) {
        if (!this.cookie) {
            await this.getAuthCookies();
        }

        const response = await putAuth(username, password, this.cookie!);

        let token: Token;
        if (response.mfa) {
            this.emit(`mfa:${uid}`, response.mfa);

            const code = await new Promise<string>((resolve, reject) => {
                this.once(`mfa:${uid}:code`, resolve);

                setTimeout(() => {
                    this.off(`mfa:${uid}:code`, resolve);
                    reject(new Error("MFA code not provided"));
                }, 300000);
            });

            token = await putAuthMfa(response.mfa.cookie, code);
        } else {
            this.emit(`mfa:${uid}`, null);
            token = response.token!;
        }

        const entitlements = await postEntitlement(token.token);
        const userinfo = await getUserInfo(token.token);
        const accountData = await byPuuid(userinfo.sub);

        const account: Account = {
            username: `${userinfo.acct.game_name}#${userinfo.acct.tag_line}`,
            region: accountData.region,
            token: token,
            entitlements: entitlements,
            puuid: userinfo.sub,
        };

        await redis.hset(`valorant:auth:${id}`, account.puuid, JSON.stringify(account));
        await redis.hset(`valorant:auth:${id}`, "selected", account.puuid);

        return account;
    }

    async auth(id: string, uuid: UUID | null = null) {
        let selected = await redis.hget(`valorant:auth:${id}`, "selected") as UUID | null;

        if (!selected && !uuid) {
            throw new Error("No account selected");
        }

        if (uuid) selected = uuid;

        const accountCache = await redis.hget(`valorant:auth:${id}`, selected!);

        if (!accountCache) {
            throw new Error("Account not found");
        }

        const account = JSON.parse(accountCache);
        this.accounts[selected!] = account;
        this.accounts[selected!].token.expires = new Date(account.token.expires);
        this.accounts.selected = selected!;

        if (account.token!.expires < new Date()) {
            await this.reAuth(selected!);
        }

        return true;
    }

    async getUserInfo(uuid: UUID | null = null) {
        const account = this.getAccount(uuid);

        if (!account) {
            throw new Error("Not logged in");
        }

        if (account.token.expires < new Date()) {
            await this.reAuth(account.puuid);
        }

        return await getUserInfo(account.token.token);
    }

    async getStore(uuid: UUID | null = null) {
        const account = this.getAccount(uuid);

        if (!account) {
            throw new Error("Not logged in");
        }

        if (account.token.expires < new Date()) {
            await this.reAuth(account.puuid);
        }

        return await getStore(account.region, account.puuid, account.token.token, account.entitlements);
    }

    async getAccounts(id: string) {
        const accountsCache = await redis.hgetall(`valorant:auth:${id}`) as Record<UUID | string, any>;

        for (const key in accountsCache) {
            if (key === "selected") {
                this.accounts.selected = accountsCache.selected;
                continue;
            }

            const account = JSON.parse(accountsCache[key]);
            this.accounts[key as UUID] = account;
            this.accounts[key as UUID].token.expires = new Date(account.token.expires);
        }

        return this.accounts;
    }
}
