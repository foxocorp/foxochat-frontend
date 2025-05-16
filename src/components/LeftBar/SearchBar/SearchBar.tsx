import { useState, useEffect, useRef } from "preact/hooks";
import styles from "./SearchBar.module.css";
import searchIcon from "@icons/navigation/magnifying-glass.svg";
import React from "react";
import { chatStore } from "@store/chat/chatStore";
import { apiMethods } from "@services/API/apiMethods";

const platformMatchers: Record<string, RegExp> = {
    windows: /windows nt/i,
    mac: /mac(?:intosh| os x)/i,
    mobile: /mobile|android|iphone|ipad|ipod/i,
    linux: /linux/i,
};

const getPlatform = (): string => {
    const userAgent = navigator.userAgent.toLowerCase();
    for (const [platform, regex] of Object.entries(platformMatchers)) {
        if (regex.test(userAgent)) return platform;
    }
    return "unknown";
};

const getShortcut = (platform: string): string => {
    switch (platform) {
        case "mac":
            return "⌘+K";
        case "windows":
            return "Ctrl + K";
        case "linux":
            return "Ctrl + Shift + K";
        default:
            return "";
    }
};

interface SearchBarProps {
    onJoinChannel: (channelId: number | null) => Promise<void>;
}

const SearchBar = ({ onJoinChannel }: SearchBarProps) => {
    const [query, setQuery] = useState("");
    const [platform] = useState(getPlatform());
    const [isSearchActive, setSearchActive] = useState(false);
    const [isBorderInactive, setBorderInactive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyPress = async (e: KeyboardEvent) => {
        if (e.key !== "Enter") return;

        const trimmed = query.trim();
        const channelId = parseInt(trimmed, 10);
        if (!trimmed || !Number.isInteger(channelId)) return;

        try {
            await chatStore.joinChannel(channelId);
            await onJoinChannel(channelId);

            setQuery("");
            setSearchActive(false);
        } catch (error) {
            console.error("Channel join error:", error);
            alert("Couldn't find or join this channel");
        }
    };

    useEffect(() => {
        const input = inputRef.current;
        if (input) {
            input.addEventListener("keypress", handleKeyPress);
            return () => { input.removeEventListener("keypress", handleKeyPress); };
        }
    }, [query]);

    useEffect(() => {
        const ctrlPlatforms = ["windows", "linux"];
        const handleKeyDown = (event: KeyboardEvent) => {
            const isShortcut =
                (platform === "mac" && event.metaKey && event.code === "KeyK") ||
                (ctrlPlatforms.includes(platform) && event.ctrlKey && event.code === "KeyK");

            if (isShortcut) {
                event.preventDefault();
                activateSearch();
            } else if (event.code === "Escape" && isSearchActive) {
                deactivateSearch();
            }
        };

        const activateSearch = () => {
            setSearchActive(true);
            setBorderInactive(false);
            inputRef.current?.focus();

            setTimeout(() => {
                setBorderInactive(true);
            }, 1000);
        };

        const deactivateSearch = () => {
            setSearchActive(false);
            setQuery("");
            inputRef.current?.blur();
        };

        window.addEventListener("keydown", handleKeyDown, true);
        return () => {
            window.removeEventListener("keydown", handleKeyDown, true);
        };
    }, [platform, isSearchActive]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement | null;
        if (target) {
            setQuery(target.value);
        }
    };


    return (
        <div className={styles["search-container"]}>
            <div className={`${styles["search-bar"]} ${isSearchActive ? styles["active"] : ""} ${isBorderInactive ? styles["inactive-border"] : ""}`}>
                <img src={searchIcon} alt="Search" className={styles["search-icon"]} />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onInput={handleChange}
                    placeholder={`Search or enter channel ID (${getShortcut(platform)})`}
                    className={`${styles["search-input"]} ${isSearchActive ? styles["active-input"] : ""}`}
                />
            </div>
        </div>
    );
};

export default SearchBar;
