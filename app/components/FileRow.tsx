import {useState} from "react";
import type {FileEntry} from "@/lib/storage";
import {formatDate, formatSize} from "@/lib/format";
import {RenameForm} from "@/app/components/RenameForm";
import {getPreviewType} from "@/lib/previewTypes";

type FileRowProperties ={
    entry: FileEntry;
    onOpenFolder: (name: string) => void;
    onDelete: (name: string) => void;
    onRename: (name: string, newName: string) => Promise<boolean>;
    onPreview: (name: string) => void;
    getDownloadUrl: (name: string) => string;
};

export function FileRow({entry, onOpenFolder, onDelete, onRename, onPreview, getDownloadUrl}
                        : FileRowProperties)
{
    const [isEditing, setIsEditing] = useState(false);

    const isFolder = entry.type === "folder";
    const icon = isFolder ? "📁" : "📄";

    function renderName() {
        if (isEditing) {
            return (
                <RenameForm name={entry.name} icon={icon}
                            onSubmit={(newName) => onRename(entry.name, newName)}
                            onClose={() => setIsEditing(false)}/>
            );
        }
        if (isFolder) {
            return (
                <button className="file-main" onClick={() => onOpenFolder(entry.name)}>
                    <span>{icon}</span>
                    <span className="file-name">{entry.name}</span>
                </button>
            );
        }
        if(getPreviewType(entry.name)){
            return(
                <button className="file-main" onClick={() => onPreview(entry.name)}>
                    <span>{icon}</span>
                    <span className="file-name">{entry.name}</span>
                </button>
            )
        }
        return (
            <a className="file-main" href={getDownloadUrl(entry.name)}>
                <span>{icon}</span>
                <span className="file-name">{entry.name}</span>
            </a>
        )

    }
    return(
        <li className="file-row">
            {renderName()}
            <span className="file-size">
                {isFolder ? "-" : formatSize(entry.size)}
            </span>
            <span className="file-date">{formatDate(entry.modified)}</span>
            <button className="icon-button" aria-label={`Rename ${entry.name}`}
                onClick={() => setIsEditing(true)}>✏️</button>
            <button className="icon-button danger" aria-label={`Delete ${entry.name}`}
                    onClick={() => onDelete(entry.name)}>🗑</button>
        </li>
    );
}