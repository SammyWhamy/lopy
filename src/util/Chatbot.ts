import { createHash } from "crypto";

export class Chatbot {
    private cookies: string | null = null;
    private lastCookieUpdate = 0;
    private cbsid: string | null = null;
    private lastResponse: string | null = null;
    private xai: string | null = null;

    private context: string[] = [];

    private readonly userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36";
    private readonly baseUrl = "https://www.cleverbot.com";

    private readonly settingParams = "cb_settings_scripting=no&islearning=1&icognoid=wsf&icognocheck=";

    public async chat(stimulus: string) {
        const _context = this.context.slice();
        stimulus = encodeURIComponent(stimulus);

        if (this.cookies === null || Date.now() - this.lastCookieUpdate >= 86400000) {
            const req = await fetch(`${this.baseUrl}/extras/conversation-social-min.js?${new Date().toISOString().split("T")[0].replaceAll("-", "")}`, {
                headers: {
                    "User-Agent": this.userAgent,
                },
            });

            this.cookies = req.headers.get("set-cookie");
            this.lastCookieUpdate = Date.now();
        }

        let payload = `stimulus=${stimulus.replaceAll("%u", "%7C")}&`;

        const reverseContext = _context.reverse();

        for (let i = 0; i < _context.length; i++) {
            payload += `vText${i + 2}=${encodeURIComponent(reverseContext[i]).replaceAll("%u", "%7C")}&`;
        }

        payload += this.settingParams;
        payload += createHash("md5").update(payload.substring(7, 33)).digest("hex");

        const magicParams = this.cbsid
            ? `&out=${encodeURIComponent(this.lastResponse!)}&in=${stimulus}&bot=c&cbsid=${this.cbsid}&xai=${this.xai}&ns=2&al=&dl=&flag=&user=&mode=1&alt=0&reac=&emo=&sou=website&xed=&`
            : "";

        const req = await fetch(`${this.baseUrl}/webservicemin?uc=UseOfficialCleverbotAPI${magicParams}`, {
            method: "POST",
            headers: {
                "Cookie": `${this.cookies!.split(";")[0]}; _cbsid=-1`,
                "User-Agent": this.userAgent,
                "Content-Type": "text/plain",
            },
            body: payload,
        });

        if (req.status !== 200) {
            console.error(`Failed to get response from Cleverbot, status: ${req.status}`);
            throw new Error("Failed to get response from Cleverbot");
        }

        const text = await req.text();

        this.cbsid = text.split("\r")[1];
        this.xai = `${this.cbsid.substring(0, 3)},${text.split("\r")[2]}`;
        this.lastResponse = text.split("\r")[0];

        this.context.push(this.lastResponse);

        if (this.context.length > 3) {
            this.context.shift();
        }

        return this.lastResponse;
    }
}
