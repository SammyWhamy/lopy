import type { Account, UUID } from "../ValorantApi.js";
import { getVersion } from "./version.js";

export type PlayerParty = {
    Subject: UUID,
    Version: number,
    CurrentPartyID: UUID,
    Invites: null;
    Requests: {
        ID: UUID;
        PartyID: UUID;
        RequestedBySubject: string;
        Subjects: UUID[];
        CreatedAt: string;
        RefreshedAt: string;
        ExpiresIn: number;
    }[];
    PlatformInfo: {
        platformType: "PC";
        platformOS: "Windows";
        platformOSVersion: string;
        platformChipset: "Unknown";
    };
}

export async function getPlayerParty(acc: Account): Promise<PlayerParty> {
    const version = await getVersion();

    const response = await fetch(`https://glz-${acc.region}-1.${acc.region}.a.pvp.net/parties/v1/players/${acc.puuid}`, {
        headers: {
            "X-Riot-ClientVersion": version.riotClientVersion,
            "X-Riot-Entitlements-JWT": acc.entitlements,
            "Authorization": `Bearer ${acc.token.token}`,
        },
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(`Failed to get player party: ${response.status}\n${JSON.stringify(data, null, 2)}`);
    }

    return await response.json();
}

export type Party = {
    ID: UUID;
    MUCName: string;
    VoiceRoomID: UUID;
    Version: number;
    ClientVersion: string;
    Members: {
        Subject: UUID;
        CompetitiveTier: number;
        PlayerIdentity: {
            Subject: UUID;
            PlayerCardID: string;
            PlayerTitleID: string;
            AccountLevel: number;
            PreferredLevelBorderID: string | "";
            Incognito: boolean;
            HideAccountLevel: boolean;
        };
        SeasonalBadgeInfo: null;
        IsOwner?: boolean | undefined;
        QueueEligibleRemainingAccountLevels: number;
        Pings: {
            Ping: number;
            GamePodID: string;
        }[];
        IsReady: boolean;
        IsModerator: boolean;
        UseBroadcastHUD: boolean;
        PlatformType: "PC";
    }[];
    State: string;
    PreviousState: string;
    StateTransitionReason: string;
    Accessibility: "OPEN" | "CLOSED";
    CustomGameData: {
        Settings: {
            Map: UUID;
            Mode: string;
            UseBots: boolean;
            GamePod: string;
            GameRules: {
                AllowGameModifiers?: string | undefined;
                IsOvertimeWinByTwo?: string | undefined;
                PlayOutAllRounds?: string | undefined;
                SkipMatchHistory?: string | undefined;
                TournamentMode?: string | undefined;
            } | null;
        };
        Membership: {
            teamOne: {
                Subject: UUID;
            }[] | null;
            teamTwo: {
                Subject: UUID;
            }[] | null;
            teamSpectate: {
                Subject: UUID;
            }[] | null;
            teamOneCoaches: {
                Subject: UUID;
            }[] | null;
            teamTwoCoaches: {
                Subject: UUID;
            }[] | null;
        };
        MaxPartySize: number;
        AutobalanceEnabled: boolean;
        AutobalanceMinPlayers: boolean;
        HasRecoveryData: boolean;
    };
    MatchmakingData: {
        QueueID: UUID;
        PreferredGamePods: string[];
        SkillDisparityRRPenalty: number;
    };
    Invites: null;
    Requests: unknown[];
    QueueEntryTime: string;
    ErrorNotification: {
        ErrorType: string;
        ErroredPlayers: {
            Subject: UUID;
        }[] | null;
    };
    RestrictedSeconds: number;
    EligibleQueues: string[];
    QueueIneligibilities: string[];
    CheatData: {
        GamePodOverride: string;
        ForcePostGameProcessing: boolean;
    };
    XPBonuses: unknown[];
}

export async function getParty(acc: Account, party: UUID) {
    const response = await fetch(`https://glz-${acc.region}-1.${acc.region}.a.pvp.net/parties/v1/parties/${party}`, {
        headers: {
            "X-Riot-Entitlements-JWT": acc.entitlements,
            "Authorization": `Bearer ${acc.token.token}`,
        },
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(`Failed to get party: ${response.status}\n${JSON.stringify(data, null, 2)}`);
    }

    return await response.json();
}
