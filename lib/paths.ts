export function joinPath(parent: string, name: string): string
{
    console.log(parent, name);
    return parent ? `${parent}/${name}` : name;
}

export function parentOf(path: string): string
{
    const slash = path.lastIndexOf('/');
    return slash === -1 ? "" : path.slice(0, slash);
}

export function downloadUrlFor(path: string): string
{
    return `/api/download?path=${encodeURIComponent(path)}`;
}
export function previewUrlFor(path: string): string
{
    return `/api/preview?path=${encodeURIComponent(path)}`;
}