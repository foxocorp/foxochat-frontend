import { useState, useRef, useEffect } from "preact/hooks";
import React from "react";
import appStore from "@store/app";
import type { SearchBarProps } from "@interfaces/interfaces";
import * as styles from "./SearchBar.module.scss";
import { apiMethods } from "@services/API/apiMethods";
import { Logger } from "@/utils/logger";

const platformMatchers: Record<string, RegExp> = {
  windows: /windows nt/i,
  mac: /mac(?:intosh| os x)/i,
  mobile: /mobile|android|iphone|ipad|ipod/i,
  linux: /linux/i,
};

const getPlatform = (): string => {
  if (typeof navigator === 'undefined') return "unknown";
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

const SearchBar = ({ onJoinChannel }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<string>("");
  const [isSearchActive, setSearchActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPlatform(getPlatform());
  }, []);

  useEffect(() => {
    const ctrlPlatforms = ["windows", "linux"];
    const handleKeyDown = (event: KeyboardEvent) => {
      const isShortcut =
        (platform === "mac" && event.metaKey && event.code === "KeyK") ||
        (ctrlPlatforms.includes(platform) &&
          event.ctrlKey &&
          event.code === "KeyK");
      if (isShortcut) {
        event.preventDefault();
        setSearchActive(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      } else if (event.code === "Escape" && isSearchActive) {
        setSearchActive(false);
        setQuery("");
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [platform, isSearchActive]);

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    const trimmed = query.trim();
    const channelId = parseInt(trimmed, 10);
    if (!trimmed) return;

    if (Number.isInteger(channelId)) {
      try {
        await appStore.joinChannel(channelId);
        await onJoinChannel?.(channelId);
        setQuery("");
        setSearchActive(false);
        return;
      } catch (error) {
        Logger.error(String(error));
      }
    }

    let user = null;
    if (Number.isInteger(channelId)) {
      try {
        user = await apiMethods.getUserById(channelId);
      } catch {}
    }
    if (!user) {
      try {
        user = await apiMethods.getUserByUsername(trimmed);
      } catch {}
    }
    if (user) {
      const channels = await apiMethods.userChannelsList();
      let dm = channels.find((ch: any) => ch.type === 1 && (ch.owner?.id === user.id || (ch.members || []).some((m: any) => m.id === user.id)));
      if (!dm) {
        dm = await apiMethods.createChannel({
          name: user.username,
          display_name: user.display_name || user.username,
          type: 1,
          public: false,
        });
      }
      await appStore.setCurrentChannel(dm.id);
      onJoinChannel?.(dm.id);
      setQuery("");
      setSearchActive(false);
      return;
    }

    alert("Couldn't find channel or user");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.currentTarget.value);
  };

  const shortcut = getShortcut(platform);
  const placeholder = shortcut ? `Search (${shortcut})` : "Search";

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchBar + (isSearchActive ? ' ' + styles.active : '')}>
        <img src={require("@/assets/icons/left-bar/navigation/magnifying-glass.svg")} alt="Search" className={styles.searchIcon} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className={`${styles.searchInput} global-search-input`}
        />
      </div>
    </div>
  );
};

export default SearchBar;
