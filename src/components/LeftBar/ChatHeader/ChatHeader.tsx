import DefaultAvatar from "@components/Base/DefaultAvatar/DefaultAvatar";
import editIcon from "@/assets/icons/left-bar/navigation/channel-edit.svg";
import plusIcon from "@/assets/icons/left-bar/navigation/create-button.svg";
import { config } from "@/lib/config/endpoints";
import * as styles from "./ChatHeader.module.scss";

interface ChatHeaderProps {
  currentUser: any;
  onEdit?: () => void;
  onAdd?: () => void;
}

const ChatHeader = ({ currentUser, onEdit, onAdd }: ChatHeaderProps) => {
  return (
    <div className={styles.headerWrapper}>
      <div className={styles.sidebarTopHeader}>
        {currentUser?.avatar?.uuid ? (
          <img
            src={`${config.cdnBaseUrl}${currentUser.avatar.uuid}`}
            alt="User Avatar"
            className={styles.sidebarTopAvatar}
          />
        ) : (
          <DefaultAvatar
            createdAt={currentUser?.created_at ?? 0}
            displayName={currentUser?.username ?? ""}
            size="medium"
          />
        )}
        <span className={styles.sidebarTopTitle}>Chats</span>
        <div className={styles.sidebarTopIcons}>
          <button className={styles.sidebarTopIconBtn} aria-label="Edit chats" onClick={onEdit}>
            <img src={editIcon} alt="Edit" />
          </button>
          <button className={styles.sidebarTopIconBtn} aria-label="Add chat" onClick={onAdd}>
            <img src={plusIcon} alt="Add" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader; 