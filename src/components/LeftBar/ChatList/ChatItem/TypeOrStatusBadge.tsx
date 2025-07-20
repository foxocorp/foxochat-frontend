import { memo } from "preact/compat";
import { ChannelType } from "foxochat.js";
import type { TypeOrStatusBadgeProps } from "@interfaces/interfaces";
import * as styles from "./ChatItem.module.scss";
import ChannelIcon from "@/assets/icons/left-bar/chat-list/channel.svg";
import GroupIcon from "@/assets/icons/left-bar/chat-list/group.svg";

export const TypeOrStatusBadge = memo(({ type, isOnline }: TypeOrStatusBadgeProps) => {
  if (type === ChannelType.DM) {
    if (!isOnline) return null;
    return <div className={styles.typeBadge + " " + styles.onlineDot} />;
  }
  return (
    <div className={styles.typeBadge}>
      {type === ChannelType.Group ? (
        <img src={GroupIcon} alt="Group" />
      ) : type === ChannelType.Channel ? (
        <img src={ChannelIcon} alt="Channel" />
      ) : null}
    </div>
  );
}); 