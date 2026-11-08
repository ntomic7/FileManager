import { describe, it, expect } from "vitest";
import path from "node:path";
import fs from "node:fs/promises";
import os from "node:os";
import { createSandboxId, isValidSandboxId, sandboxRootFor, SANDBOX_BASE,
        cleanupSandboxes} from "@/lib/sandbox";


describe("isValidSandboxId", () => {
    it("accepts a freshly generated id", () => {
        expect(isValidSandboxId(createSandboxId())).toBe(true);
    });

    it("rejects undefined and an empty string", () => {
        expect(isValidSandboxId(undefined)).toBe(false);
        expect(isValidSandboxId("")).toBe(false);
    });

    it("rejects path traversal", () => {
        expect(isValidSandboxId("../../etc")).toBe(false);
        expect(isValidSandboxId("..")).toBe(false);
    });

    it("rejects a valid id with something added to it", () => {
        const id = createSandboxId();
        expect(isValidSandboxId(id + "/..")).toBe(false);
        expect(isValidSandboxId(id + "\n")).toBe(false);
        expect(isValidSandboxId("../" + id)).toBe(false);
    });

    it("rejects uppercase and wrong lengths", () => {
        expect(isValidSandboxId(createSandboxId().toUpperCase())).toBe(false);
        expect(isValidSandboxId("abc")).toBe(false);
    });
});

describe("sandboxRootFor", () => {
    it("puts the sandbox inside the sandbox base folder", () => {
        const id = createSandboxId();
        expect(sandboxRootFor(id)).toBe(path.join(SANDBOX_BASE, id));
    });

    it("throws on an invalid id", () => {
        expect(() => sandboxRootFor("../../etc")).toThrow("Invalid sandbox id");
    });
});

async function exists(p: string): Promise<boolean> {
    return fs.access(p).then(() => true, () => false);
}

describe("cleanupSandboxes", () => {
    it("removes only old sandbox folders", async () => {
        const base = await fs.mkdtemp(path.join(os.tmpdir(), "sandbox-test-"));
        try {
            const oldId = createSandboxId();
            const freshId = createSandboxId();
            await fs.mkdir(path.join(base, oldId));
            await fs.mkdir(path.join(base, freshId));
            await fs.mkdir(path.join(base, "not-a-sandbox"));

            const longAgo = new Date(Date.now() - 10 * 60 * 60 * 1000);
            await fs.utimes(path.join(base, oldId), longAgo, longAgo);
            await fs.utimes(path.join(base, "not-a-sandbox"), longAgo, longAgo);

            const removed = await cleanupSandboxes(base);

            expect(removed).toBe(1);
            expect(await exists(path.join(base, oldId))).toBe(false);
            expect(await exists(path.join(base, freshId))).toBe(true);
            expect(await exists(path.join(base, "not-a-sandbox"))).toBe(true);
        } finally {
            await fs.rm(base, {recursive: true, force: true});
        }
    });

    it("does nothing when the folder does not exist", async () => {
        const missing = path.join(os.tmpdir(), "missing-" + createSandboxId());
        expect(await cleanupSandboxes(missing)).toBe(0);
    });
});