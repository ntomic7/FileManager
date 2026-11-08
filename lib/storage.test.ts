import { describe, it, expect } from "vitest";
import path from "node:path";
import fs from "node:fs/promises";
import os from "node:os";
import { checkIfSafe, validateName, folderSize, saveFile, SANDBOX_QUOTA_BYTES} from "@/lib/storage";

const ROOT = path.join(process.cwd(), "test-root");

describe("checkIfSafe", () => {
    describe("accepts paths inside the storage folder", () => {
        it("treats an empty path as the storage root", () => {
            expect(checkIfSafe(ROOT,"")).toBe(ROOT);
        });

        it("resolves a normal folder", () => {
            expect(checkIfSafe(ROOT,"photos")).toBe(path.join(ROOT, "photos"));
        });

        it("resolves nested paths", () => {
            expect(checkIfSafe(ROOT,"photos/2024/trip.jpg"))
                .toBe(path.join(ROOT, "photos", "2024", "trip.jpg"));
        });

        it("allows .. when it stays inside the storage folder", () => {
            expect(checkIfSafe(ROOT,"photos/../docs"))
                .toBe(path.join(ROOT, "docs"));
        });

        it("allows going back up to the root exactly", () => {
            expect(checkIfSafe(ROOT,"photos/..")).toBe(ROOT);
        });
    });

    describe("rejects paths that escape the storage folder", () => {
        it("rejects ..", () => {
            expect(() => checkIfSafe(ROOT,"..")).toThrow("outside");
        });

        it("rejects ../ followed by a name", () => {
            expect(() => checkIfSafe(ROOT,"../secret.txt")).toThrow("outside");
        });

        it("rejects traversal hidden in the middle", () => {
            expect(() => checkIfSafe(ROOT,"photos/../../secret.txt")).toThrow("outside");
        });

        it("rejects too many ..", () => {
            expect(() => checkIfSafe(ROOT,"a/b/../../../..")).toThrow("outside");
        });

        it("rejects absolute paths", () => {
            expect(() => checkIfSafe(ROOT,"/etc/passwd")).toThrow("outside");
        });

        it("rejects a sibling folder that merely starts with the same name", () => {
            expect(() => checkIfSafe(ROOT,"../storage-evil/file.txt")).toThrow("outside");
        });
        it("cannot reach a sibling sandbox", () => {
            const sandboxA = path.join(ROOT, "aaaa");
            expect(() => checkIfSafe(sandboxA, "../bbbb/secret.txt")).toThrow("outside");
        });
    });

    describe("rejects invalid input", () => {
        it("rejects null characters", () => {
            expect(() => checkIfSafe(ROOT,"photos\0.txt")).toThrow("Invalid path");
        });
    });
});

describe("validateName", () => {
    describe("accepts normal names", () => {
        it("returns a simple name unchanged", () => {
            expect(validateName("photos")).toBe("photos");
        });

        it("allows dots, spaces and dashes", () => {
            expect(validateName("my file-v2.final.txt")).toBe("my file-v2.final.txt");
        });

        it("allows names that start with a dot", () => {
            expect(validateName(".gitkeep")).toBe(".gitkeep");
        });

        it("trims surrounding whitespace", () => {
            expect(validateName("  notes.txt  ")).toBe("notes.txt");
        });

        it("allows .. inside a longer name", () => {
            expect(validateName("a..b")).toBe("a..b");
        });
    });

    describe("rejects names that could change the location", () => {
        it("rejects an empty name", () => {
            expect(() => validateName("")).toThrow("Invalid name");
        });

        it("rejects a name that is only spaces", () => {
            expect(() => validateName("   ")).toThrow("Invalid name");
        });

        it("rejects .", () => {
            expect(() => validateName(".")).toThrow("Invalid name");
        });

        it("rejects ..", () => {
            expect(() => validateName("..")).toThrow("Invalid name");
        });

        it("rejects .. surrounded by spaces", () => {
            expect(() => validateName(" .. ")).toThrow("Invalid name");
        });

        it("rejects forward slashes", () => {
            expect(() => validateName("a/b")).toThrow("Invalid name");
            expect(() => validateName("../evil")).toThrow("Invalid name");
        });

        it("rejects backslashes", () => {
            expect(() => validateName("a\\b")).toThrow("Invalid name");
            expect(() => validateName("..\\evil")).toThrow("Invalid name");
        });

        it("rejects null characters", () => {
            expect(() => validateName("file\0.txt")).toThrow("Invalid name");
        });
    });
});

describe("quota", () => {
    async function withTempRoot(run: (root: string) => Promise<void>) {
        const root = await fs.mkdtemp(path.join(os.tmpdir(), "quota-test-"));
        try {
            await run(root);
        } finally {
            await fs.rm(root, {recursive: true, force: true});
        }
    }

    it("folderSize adds up files in nested folders", async () => {
        await withTempRoot(async (root) => {
            await fs.mkdir(path.join(root, "sub"));
            await fs.writeFile(path.join(root, "a.txt"), "12345");
            await fs.writeFile(path.join(root, "sub", "b.txt"), "1234567");

            expect(await folderSize(root)).toBe(12);
        });
    });

    it("saveFile stores a file that fits", async () => {
        await withTempRoot(async (root) => {
            await saveFile(root, "", "a.txt", Buffer.from("hello"));

            expect(await folderSize(root)).toBe(5);
        });
    });

    it("saveFile refuses a file that goes over the quota", async () => {
        await withTempRoot(async (root) => {
            await saveFile(root, "", "a.txt", Buffer.from("hello"));

            await expect(
                saveFile(root, "", "big.bin", Buffer.alloc(SANDBOX_QUOTA_BYTES))
            ).rejects.toMatchObject({code: "EQUOTA"});

            expect(await folderSize(root)).toBe(5);
        });
    });
});