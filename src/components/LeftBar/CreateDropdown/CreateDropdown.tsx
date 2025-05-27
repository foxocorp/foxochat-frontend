import { useRef, useEffect } from "preact/hooks";
import { CreateDropdownProps } from "@interfaces/interfaces"
import styles from "./CreateDropdown.module.scss";
import { memo } from "preact/compat";

const CreateDropdown = ({ onSelect, onClose }: CreateDropdownProps) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, []);

    return (
        <div ref={dropdownRef} className={styles.dropdown}>
            <div className={styles.menu}>
                <button className={styles.item} onClick={() => { onSelect("group"); }}>
                    New Group
                </button>
                <button className={styles.item} onClick={() => { onSelect("channel"); }}>
                    New Channel
                </button>
            </div>
        </div>
    );
};

export default memo(CreateDropdown);
