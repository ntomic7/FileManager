import {Modal} from "@/app/components/Modal";

type ConfirmDialogProperties = {
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export function ConfirmDialog({title, message, confirmLabel = "Confirm", onConfirm, onCancel}:
                              ConfirmDialogProperties)
{
    return (
        <Modal title={title} onClose={onCancel}>
            <p className="dialog-message">{message}</p>
            <div className="dialog-actions">
                <button className="secondary-button" autoFocus onClick={onCancel}>Cancel</button>
                <button className="danger-button" onClick={onConfirm}>{confirmLabel}</button>
            </div>
        </Modal>
    );
}