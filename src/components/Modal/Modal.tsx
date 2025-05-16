import { useEffect } from "preact/hooks";
import style from "./Modal.module.scss";
import { Button } from "@components/Base/Buttons/Button";
import { JSX } from "preact";

interface ModalProps {
    title: string;
    description: string;
    onClose: () => void;
    actionButtons?: JSX.Element[];
    icon?: string | undefined;
}

export const Modal = ({ title, description, onClose, actionButtons = [], icon }: ModalProps) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => { window.removeEventListener("keydown", handleKeyDown); };
    }, [onClose]);

    return (
        <div className={`${style.overlay} ${style.visible}`} onClick={onClose}>
            <div className={style.modal} onClick={(e) => { e.stopPropagation(); }}>
                <h2 className={style.title}>{title}</h2>
                <div className={style.description}>
                    <span>{typeof description === "object" ? JSON.stringify(description) : description}</span>
                </div>
                <div className={style.actions}>
                    {actionButtons.length > 0 ? actionButtons : (
                        <Button onClick={onClose} fontWeight={500} variant="primary" icon={icon}>
                            Close
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};