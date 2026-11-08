import React, {useEffect} from "react";

type ModalProperties = {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    actions?: React.ReactNode;
    narrow?: boolean;
};

export function Modal({title, onClose, children, actions, narrow}: ModalProperties)
{
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if(event.key === "Escape") onClose();
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return(
        <div className="modal-backdrop" onClick={onClose}>
            <div className={narrow ? "modal narrow" : "modal"} role="dialog"
                aria-modal="true" aria-label={title}
                onClick={(event) => event.stopPropagation()}>

                <header className="modal-header">
                    <span className="modal-title">{title}</span>
                    {actions}
                    <button className="modal-action" aria-label="Close" onClick={onClose}>✕</button>
                </header>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    )
}