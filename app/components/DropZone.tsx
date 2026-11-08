import React, {useState} from "react";

type DropZoneProperties = {
    onFiles: (files: File[]) => void;
    children: React.ReactNode;
};

export function DropZone({onFiles, children}: DropZoneProperties)
{
    const [isDragging, setIsDragging] = useState(false);

    function hasFiles(event: React.DragEvent): boolean{
        return event.dataTransfer.types.includes("Files");
    }

    return(
        <div className={isDragging ? "drop-zone dragging" : "drop-zone"}
             onDragOver={(event) => {
                 if(!hasFiles(event)) return;
                 event.preventDefault();
                 setIsDragging(true);
             }}
             onDragLeave={(event) => {
                 if(!event.currentTarget.contains(event.relatedTarget as Node | null))
                     setIsDragging(false);
             }}
             onDrop={(event) => {
                if(!hasFiles(event)) return;
                event.preventDefault();
                setIsDragging(false);
                onFiles(Array.from(event.dataTransfer.files));
        }}>{children}</div>
    );
}