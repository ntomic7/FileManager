const PREVIEW_TYPES: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".txt": "text/plain; charset=utf-8",
    ".md": "text/plain; charset=utf-8",
    ".json": "text/plain; charset=utf-8",
    ".csv": "text/plain; charset=utf-8",
    ".log": "text/plain; charset=utf-8",
};

export function getPreviewType(fileName: string): string | null
{
    const dot = fileName.lastIndexOf(".");
    if(dot === -1) return null;

    return PREVIEW_TYPES[fileName.slice(dot).toLowerCase()] ?? null;
}

