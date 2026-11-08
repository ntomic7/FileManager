import {useState, useEffect, SubmitEvent} from "react";
import {useErrorMessage} from "@/hooks/useErrorMessage";

type NewFolderFormProperties = {
    currentPath: string;
    onCreated: () => void;
};

export function NewFolderForm({currentPath, onCreated}: NewFolderFormProperties)
{
    const [name, setName] = useState(" ");
    const [error, setError] = useErrorMessage();

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>){
        event.preventDefault();
        setError(null);

        const result = await fetch("/api/files", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({path: currentPath, name: name}),
        });

        if(!result.ok){
            const data = await result.json();
            setError(data.error);
            return;
        }

        setName("");
        onCreated();
    }

    return (
        <form className="new-folder" onSubmit={handleSubmit}>
            {error && <span className="form-error">{error}</span>}
            <input value={name} autoFocus onChange={(event)=>
                setName(event.target.value)} placeholder="New folder name" />
            <button type="submit" disabled={name.trim() === ""}>Create Folder</button>
        </form>
    );
}