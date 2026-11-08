type SearchBoxProperties = {
    value: string;
    onChange: (value: string) => void;
    allFolders: boolean;
    onAllFoldersChange: (value: boolean) => void;
};

export function SearchBox({value, onChange, allFolders, onAllFoldersChange}: SearchBoxProperties)
{
    return (
    <div className="search-row">
        <input className="search" type="search"
               placeholder={allFolders ? "Search all folders" : "Search in this folder"}
               aria-label="Search" value={value}
               onChange={(e) => onChange(e.target.value)} />
        <label className="search-toggle">
            <input type="checkbox" checked={allFolders}
                   onChange={(e) =>
                       onAllFoldersChange(e.target.checked)} />
        All folders</label>
    </div>);
}