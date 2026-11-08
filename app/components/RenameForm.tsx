import {useState} from "react";

type RenameFormProperties = {
    name: string;
    icon: string;
    onSubmit: (newName: string) => Promise<boolean>;
    onClose: () => void;
};

export function RenameForm({name, icon, onSubmit, onClose}: RenameFormProperties)
{
    const [draft, setDraft] = useState(name);

    async function commit(){
        const newName = draft.trim();

        if(newName === "" || newName === name){
            onClose();
            return;
        }

        const ok = await onSubmit(newName);
        if(ok) onClose();
    }

    return(
        <form className="file-main" onSubmit={(event) =>
        {event.preventDefault(); commit();}}>
            <span>{icon}</span>
            <input className="rename-input" value={draft} autoFocus
                   onFocus={(event) => event.target.select()}
                   onChange={(event) => setDraft(event.target.value)}
                   onBlur={() => onClose()}
                   onKeyDown={(event) => {if (event.key === "Escape") onClose();}} />
                   </form>
    )
}