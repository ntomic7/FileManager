import {useEffect, useState} from "react";
import {getPreviewType} from "@/lib/previewTypes";
import {Modal} from "@/app/components/Modal";

const MAX_CHARS = 200_000;

type PreviewModalProperties = {
    name: string;
    previewUrl: string;
    downloadUrl: string;
    onClose: () => void;
};

export function PreviewModal({name, previewUrl, downloadUrl, onClose}: PreviewModalProperties)
{
    const isImage = getPreviewType(name)?.startsWith("image/") ?? false;
    const [text, setText] = useState<string | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if(isImage) return;

        let modalClosed = false;

        fetch(previewUrl).then((response) => {
            if(!response.ok) throw new Error("Failed to load");
            return response.text();
        }).then((content) => {
            if(modalClosed) return;
            setText(content.length > MAX_CHARS ?
            content.slice(0, MAX_CHARS) + "\n\n... truncated" : content);
        }).catch(() => {if (!modalClosed) setFailed(true);});

        return () => {modalClosed = true;};
    }, [isImage, previewUrl]);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if(event.key === "Escape") onClose();
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);
    function renderBody(){
        if(isImage) return <img src={previewUrl} alt={name} />;
        if(failed) return <p className="error">Could not load the preview</p>;
        if(text === null) return <p className="empty">Loading...</p>;
        return <pre>{text}</pre>;
    }

    return(
        <Modal title={name} onClose={onClose} actions={<a className="modal-action"
            href={downloadUrl}>Download</a>}>
            {renderBody()}
            </Modal>
    )

}