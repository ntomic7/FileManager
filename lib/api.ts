async function readError(res: Response): Promise<string>
{
    const data = await res.json().catch(() => null);
    return data?.error ?? "Something went wrong";
}
export async function requestDelete(path: string): Promise<string |null>
{
    const result = await fetch(`/api/files?path=${encodeURIComponent(path)}`, {
        method: "DELETE",
    });

    return result.ok ? null : readError(result);
}

export async function requestRename(path: string, name: string): Promise<string | null>
{
    const result = await fetch(`/api/files?path=${encodeURIComponent(path)}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({path, name}),
    });
    return result.ok ? null : readError(result);
}

async function uploadFile(path: string, file: File): Promise<string | null>
{
    try{
        const form = new FormData();
        form.append("path", path);
        form.append("file", file);

        const res = await fetch("/api/upload", {method: "POST", body: form});
        return res.ok ? null : `${file.name}: ${await readError(res)}`;
    } catch{
        return `${file.name}: could not be read`;
    }
}
export async function uploadFiles(path: string, files: File[]): Promise<string[]>
{
    const errors: string[] = [];

    for(const file of files)
    {
        const message = await uploadFile(path, file);
        if(message) errors.push(message);
    }

    return errors;
}


export {readError};