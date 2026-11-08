import {useEffect, useState} from "react";
import type {SearchResult} from "@/lib/storage";
import {readError} from "@/lib/api";

type SearchState = {
    query: string;
    items: SearchResult[];
    truncated: boolean;
};

export function useGlobalSearch(query: string, checkingAllFolders: boolean, onError: (message: string) => void)
{
    const [result, setResult] = useState<SearchState | null>(null);

    useEffect(() => {
        if(!checkingAllFolders) return;
        let searchCancelled = false;

        const timer = setTimeout(async () => {
            const res = await fetch(`/api/search?q=${(encodeURIComponent(query))}`);

            if(!res.ok){
                const message = await readError(res);
                if(!searchCancelled) onError(message);
                return;
            }
            const data = await res.json();
            if(searchCancelled) return;

            setResult({query: query, items: data.results, truncated: data.truncated});
        }, 300);

        return () => {
            searchCancelled = true;
            clearTimeout(timer);
        }
    }, [query, checkingAllFolders, onError]);

    const current = result && result.query === query ? result : null;

    return {current, isSearching: checkingAllFolders && current === null};
}