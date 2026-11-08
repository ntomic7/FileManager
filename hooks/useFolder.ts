import {useCallback, useEffect, useState} from "react";
import type {FileEntry} from "@/lib/storage";
import {readError} from "@/lib/api";

export function useFolder(path: string)
{
    const [entries, setEntries] = useState<FileEntry[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const [loadedPath, setLoadedPath] = useState<string | null>(null);

    useEffect(() => {
        let folderClosed = false;

        async function load(){
            const result = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
            const data = await result.json();
            if(folderClosed) return;
            setLoadedPath(path);

            if(!result.ok){
                setError(data.error);
                return;
            }
            setError(null);
            setEntries(data.entries);
        }
        load();
        return () => {folderClosed = true;};
    }, [path, reloadKey]);

    const reload = useCallback(() => setReloadKey((key) => key + 1), []);

    return {entries, error, reload, isLoading: loadedPath !== path};
}