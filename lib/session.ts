import {cookies} from "next/headers";
import {createSandboxId, isValidSandboxId, ensureSandbox,
        cleanupSandboxes, SANDBOX_TTL_MS} from "@/lib/sandbox";

const COOKIE_NAME = "sandbox";
const MAX_AGE_SECONDS = SANDBOX_TTL_MS / 1000;

const CLEANUP_EVERY_MS = 10 * 60 * 1000;
let lastCleanup = 0;

function checkIfTimeTorCleanup(): void
{
    const now = Date.now();
    if(now - lastCleanup < CLEANUP_EVERY_MS) return;

    lastCleanup = now;
    cleanupSandboxes().catch(() => {});
}

export async function getSandboxRoot(): Promise<string>
{
    const cookieStore = await cookies();
    const current = cookieStore.get(COOKIE_NAME)?.value;

    const id = isValidSandboxId(current) ? current : createSandboxId();

    cookieStore.set(COOKIE_NAME, id, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: MAX_AGE_SECONDS,
    });

    const root = await ensureSandbox(id);
    checkIfTimeTorCleanup();
    return root;
}