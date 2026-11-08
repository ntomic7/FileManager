import fs from "node:fs/promises";
import path from "node:path";

export function checkIfSafe(root: string, relativePath: string): string
{
    if(relativePath.includes("\0")) throw new Error("Invalid path");

    const resolvedRoot = path.resolve(root);
    const target = path.resolve(resolvedRoot, relativePath);

    const isRoot = target == resolvedRoot;
    const isInside = target.startsWith(resolvedRoot + path.sep);

    if(!isRoot && !isInside)
        throw new Error("Path is outside the storage folder");

    return target;
}

export async function ensureStorageRoot(root: string): Promise<void>
{
    await fs.mkdir(root, {recursive: true});
}

export type FileEntry = {
    name: string;
    type: "file" | "folder";
    size: number;
    modified: string;
}

// OPEN FILE
export async function readFile(root: string, relativePath: string): Promise<{name: string, data: Buffer}>
{
    const target = checkIfSafe(root, relativePath);
    const stats = await fs.stat(target);

    if(!stats.isFile())
        throw new Error("Not a file");

    return {name: path.basename(target), data: await fs.readFile(target) };
}

// GET ALL ENTRIES IN THAT FOLDER
export async function listDirectory(root: string, relativePath: string): Promise<FileEntry[]>
{
    await ensureStorageRoot(root);
    const dir = checkIfSafe(root, relativePath);
    const dirEntries = await fs.readdir(dir, {withFileTypes: true});

    const entries = await Promise.all(dirEntries.filter((d) => d.isFile() || d.isDirectory())
        .map(async (d): Promise<FileEntry> => {
            const stats = await fs.stat(path.join(dir, d.name));
            return {
                name: d.name,
                type: d.isDirectory() ? "folder" : "file",
                size: d.isDirectory() ? 0 : stats.size,
                modified: stats.mtime.toISOString(),
            };
        }));

    entries.sort((a,b) => {
        if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
        return a.name.localeCompare(b.name);
    });

    return entries;
}

// CREATE NEW FOLDER
export function validateName(name: string): string
{
    const trimmed = name.trim();

    if(trimmed === "" || trimmed === "." || trimmed === ".." ||
        /[\\/\0]/.test(trimmed))
    {
        throw new Error("Invalid name");
    }
    return trimmed;
}

export async function createFolder(root: string, parentPath: string, name: string): Promise<void>
{
    await ensureStorageRoot(root);

    const parent = checkIfSafe(root, parentPath);
    const target = path.join(parent, validateName(name));

    await fs.mkdir(target);
}

// UPLOAD FILE
export async function saveFile(root: string, parentPath: string, name: string, data: Buffer): Promise<void>
{
    await ensureStorageRoot(root);

    const parent = checkIfSafe(root, parentPath);
    const usedStorage = await folderSize(root);
    if(usedStorage + data.length > SANDBOX_QUOTA_BYTES){
        const error = new Error("Storage limit reached") as NodeJS.ErrnoException;
        error.code = "EQUOTA";
        throw error;
    }
    const target = path.join(parent, validateName(name));

    await fs.writeFile(target, data, {flag: "wx"});
}

// RENAME
export async function renameEntry(root: string, relativePath: string, newName: string): Promise<void>
{
    const pathToItem = checkIfSafe(root, relativePath);

    if(pathToItem === path.resolve(root))
        throw new Error("Cannot rename the storage root");
    const targetPath = path.join(path.dirname(pathToItem), validateName(newName));

    const isCaseOnlyChange = pathToItem.toLowerCase() === targetPath.toLowerCase();
    const exists = await fs.access(targetPath).then(
        () => true, () => false);

    if(exists && !isCaseOnlyChange){
        const error = new Error("Already exists") as NodeJS.ErrnoException;
        error.code = "EEXIST";
        throw error;
    }

    await fs.rename(pathToItem, targetPath);
}
// DELETE

export async function deleteEntry(root: string, relativePath: string): Promise<void>
{
    const target = checkIfSafe(root, relativePath);
    if(target === path.resolve(root))
        throw new Error("Cannot delete the storage root");

    await fs.rm(target, {recursive: true});
}

// SEARCH
export type SearchResult = FileEntry & {path: string};

export const SEARCH_LIMIT = 200;

export async function searchEntries(root: string, query: string): Promise<SearchResult[]>
{
    await ensureStorageRoot(root);

    const cleanQuery = query.trim().toLowerCase();
    if(cleanQuery === "") return [];

    const results: SearchResult[] = [];

    async function walkThroughList(dir: string, relativeDir: string): Promise<void>
    {
        const dirEntries = await fs.readdir(dir, { withFileTypes: true });

        for(const dirEntry of dirEntries) {
            if (results.length >= SEARCH_LIMIT) return;
            if (!dirEntry.isFile() && !dirEntry.isDirectory()) continue;

            const fullPath = path.join(dir, dirEntry.name);
            const relativePath = relativeDir ? `${relativeDir}/${dirEntry.name}` : dirEntry.name;

            if (dirEntry.name.toLowerCase().includes(cleanQuery)) {
                const stats = await fs.stat(fullPath);
                results.push({
                    name: dirEntry.name,
                    type: dirEntry.isDirectory() ? "folder" : "file",
                    size: dirEntry.isDirectory() ? 0 : stats.size,
                    modified: stats.mtime.toISOString(),
                    path: relativePath,
                });
            }

            if (dirEntry.isDirectory())
                await walkThroughList(fullPath, relativePath);
        }
    }
    await walkThroughList(root, "");
    return results;
}

// QUOTA FOR SANDBOX

export const SANDBOX_QUOTA_BYTES = 100 * 1024 * 1024;

export async function folderSize(dir:string): Promise<number>
{
    const entries = await fs.readdir(dir, { withFileTypes: true });

    let total = 0;
    for(const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if(entry.isDirectory())
            total += await folderSize(fullPath);
        else if(entry.isFile())
            total += ((await fs.stat(fullPath)).size);
    }

    return total;
}