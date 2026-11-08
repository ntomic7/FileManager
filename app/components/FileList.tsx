import {FileEntry} from "@/lib/storage";
import {FileRow} from "@/app/components/FileRow";

type FileListProperties =  {
    entries: FileEntry[];
    onOpenFolder: (name: string) => void;
    onDelete: (name: string) => void;
    onRename: (name: string, newName:string) => Promise<boolean>;
    onPreview: (name: string) => void;
    getDownloadUrl: (name: string) => string;
};

export function FileList({entries, onOpenFolder, onDelete, onRename, onPreview, getDownloadUrl}
                         : FileListProperties)
{
    if(entries.length === 0) return <p>This folder is empty.</p>;

    return (
        <ul className="file-list">
            {entries.map((entry) => (
                <FileRow key={entry.name} entry={entry} onOpenFolder={onOpenFolder}
                    onDelete={onDelete} onRename={onRename} onPreview={onPreview}
                         getDownloadUrl={getDownloadUrl}/>
            ))}
        </ul>
    );
}