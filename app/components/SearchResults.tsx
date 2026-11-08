import {SearchResult} from "@/lib/storage";
import {formatDate, formatSize} from "@/lib/format";
import {parentOf} from "@/lib/paths";

type SearchResultProperties = {
    items: SearchResult[];
    truncated: boolean;
    onGo: (path:string) => void;
    onOpenFile: (path:string) => void;
};

export function SearchResults({items, truncated, onGo, onOpenFile}: SearchResultProperties)
{
    if(items.length === 0)
        return <p className="emtpy">No matches in any folder.</p>;

    return(
        <>
            <ul className="file-list">
                {items.map((item) => {
                    const isFolder = item.type === "folder";
                    return(
                        <li key={item.path}>
                            <button className="file-row search-result"
                                    onClick={() => isFolder ? onGo(item.path) : onOpenFile(item.path)}>
                                <span>{isFolder ? "📁" : "📄"}</span>
                                <span className="file-name">{item.name}</span>
                                <span className="search-path">
                                    {parentOf(item.path) || "Home"}
                                </span>
                                <span className="file-meta file-size">
                                    {isFolder ? "—" : formatSize(item.size)}
                                </span>
                                <span className="file-meta file-date">
                                    {formatDate(item.modified)}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
            {truncated && (<p className="empty">
                Showing the first results only. Try a longer search.</p>)}
        </>
    );
}