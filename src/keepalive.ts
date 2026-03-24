/**
 * Keep-alive service: pings the app itself to prevent HF Spaces from sleeping.
 * HF free tier sleeps after ~48h of inactivity.
 */

const PING_INTERVAL_MS = 25 * 60 * 1000; // 25 minutes

export function startKeepAlive(port: number): void {
    const url = `http://localhost:${port}/health`;

    setInterval(async () => {
        try {
            const res = await fetch(url);
            if (res.ok) {
                console.log(`[keep-alive] ping OK at ${new Date().toISOString()}`);
            }
        } catch {
            console.warn(`[keep-alive] ping failed at ${new Date().toISOString()}`);
        }
    }, PING_INTERVAL_MS);

    console.log(`[keep-alive] started, pinging every ${PING_INTERVAL_MS / 60000} minutes`);
}
