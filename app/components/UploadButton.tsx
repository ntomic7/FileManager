import {useState, ChangeEvent} from "react";
import {useErrorMessage} from "@/hooks/useErrorMessage";
import {uploadFiles} from "@/lib/api";

type UploadButtonProperties = {
    currentPath: string;
    onUploaded: () => void;
    onError: (message: string) => void;
};

export function UploadButton({currentPath, onUploaded, onError}: UploadButtonProperties)
{
    const [uploading, setUploading] = useState(false);

    async function handleChange(event: ChangeEvent<HTMLInputElement>)
    {
        const input = event.target;
        if (!input.files || input.files.length === 0) return;

        const files = Array.from(input.files);

        setUploading(true);

        const errors = await uploadFiles(currentPath, files);
        if(errors.length > 0) onError(errors.join(" . "));

        input.value = "";
        setUploading(false);
        onUploaded();
    }

    return (
        <div className="upload">
            <label className="upload-button">
                {uploading ? "Uploading..." : "Upload files"}
                <input type="file"  multiple hidden disabled={uploading} onChange={handleChange} />
            </label>
        </div>
    )
}