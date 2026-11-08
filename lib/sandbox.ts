import {randomUUID} from "node:crypto";
import path from "node:path";
import fs from "node:fs/promises"

export const SANDBOX_BASE = path.join(process.cwd(), "storage", "sandboxes");
export const MAX_SANDBOXES = 100;
const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function createSandboxId(): string
{
    return randomUUID();
}
export function isValidSandboxId(id: string | undefined): id is string
{
    return typeof id === "string" && ID_PATTERN.test(id);
}
export function sandboxRootFor(id: string): string
{
    if(!isValidSandboxId(id))
        throw new Error("Invalid sandbox id");

    return path.join(SANDBOX_BASE, id);
}

export const SEED_DIR = path.join(process.cwd(), "seed");

export async function ensureSandbox(id: string): Promise<string>
{
    const root = sandboxRootFor(id);

    const exists = await fs.access(root).then(() => true, () => false);
    if(!exists){
        const existingSandboxes = await fs.readdir(SANDBOX_BASE).catch(() => []);
        if(existingSandboxes.length > MAX_SANDBOXES)
            throw new Error("Too many active sandboxes");

        await fs.mkdir(root, { recursive: true });
        await fs.cp(SEED_DIR, root, {recursive: true});
    }

    const now = new Date();
    await fs.utimes(root, now, now);

    return root;
}

// delete old sandboxes
export const SANDBOX_TTL_MS = 6 * 60 * 60 * 1000;

export async function cleanupSandboxes(base: string = SANDBOX_BASE,
                                       now: number = Date.now(),
                                       ttlMs: number = SANDBOX_TTL_MS): Promise<number>
{
    const entries = await fs.readdir(base, {withFileTypes: true}).catch(() => []);

    let removed = 0;
    for(const entry of entries){
        if(!entry.isDirectory() || !isValidSandboxId(entry.name)) continue;

        try{
            const folder = path.join(base, entry.name);
            const stats = await fs.stat(folder);

            if(now - stats.mtimeMs > ttlMs){
                await fs.rm(folder, {recursive: true, force: true});
                removed++;
            }
        }catch{

        }
    }
    return removed;
}






