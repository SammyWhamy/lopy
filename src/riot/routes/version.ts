export type Version = {
    manifestId: string,
    branch: string,
    version: string,
    buildVersion: string,
    engineVersion: string,
    riotClientVersion: string,
    riotClientBuild: string,
    buildDate: string,
}

export async function getVersion(): Promise<Version> {
    const response = await fetch("https://valorant-api.com/v1/version");

    if (!response.ok) {
        const data = await response.json();
        throw new Error(`Failed to get version data: ${response.status}\n${JSON.stringify(data, null, 2)}`);
    }

    const data = await response.json();

    return data.data;
}
